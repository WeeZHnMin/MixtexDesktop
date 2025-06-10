# MixtexDesktop

<p align="center">
  <img src="assets/icon.ico" width="450" height="450">
</p>

**MixtexDesktop** is a desktop application designed to:

* Convert images containing math text (such as handwritten or printed equations) into **LaTeX** format.
* Convert **LaTeX** code into a **.docx** file compatible with Microsoft Word or WPS Office.

This tool is very useful for students, researchers, and educators who often work with mathematical documents.

---

## ✨ Features

* 🖼️ Image-to-LaTeX conversion powered by deep learning
  基于深度学习的图片识别，自动生成 LaTeX 数学公式
* 📄 LaTeX-to-DOCX conversion, compatible with Word and WPS Office
  将 LaTeX 文本转换为 Word (.docx) 文档，兼容 Microsoft Office 和 WPS

---

![演示效果](./show.gif)

## Usage Guide 使用教程

### Step 1: Download models

Open PowerShell in the project root directory (`./MixtexDesktop-main`) and run:

```powershell
mkdir backend\models
Invoke-WebRequest -Uri "https://huggingface.co/wzmmmm/_wmzmz/resolve/main/encoder_model.onnx" -OutFile "backend/models/encoder_model.onnx"
Invoke-WebRequest -Uri "https://huggingface.co/wzmmmm/_wmzmz/resolve/main/decoder_model.onnx" -OutFile "backend/models/decoder_model.onnx"
```

通过以上命令可以将模型下载到本地。
If you are unable to download via PowerShell, please download the files manually:

* Visit: [https://huggingface.co/wzmmmm/\_wmzmz/tree/main](https://huggingface.co/wzmmmm/_wmzmz/tree/main)
* Download the following two files:

  * `encoder_model.onnx`
  * `decoder_model.onnx`

Then, place them into the `backend/models` directory in your project.

如果无法通过 PowerShell 下载，请手动打开上面链接，将模型文件下载后放入项目中的 `backend/models` (没有请创建)目录下。

### Step 2: Download Pandoc

Use PowerShell to download Pandoc:

```powershell
Invoke-WebRequest -Uri "https://github.com/jgm/pandoc/releases/download/3.7.0.2/pandoc-3.7.0.2-windows-x86_64.zip" -OutFile "pandoc/pandoc-3.7.0.2-windows-x86_64.zip"
```

Or use CMD terminal with curl:

```cmd
curl -L -o pandoc/pandoc-3.7.0.2-windows-x86_64.zip https://github.com/jgm/pandoc/releases/download/3.7.0.2/pandoc-3.7.0.2-windows-x86_64.zip
```

现在你已经下载了模型和Pandoc工具。如果终端无法拉取到 `pandoc`，请前往https://github.com/jgm/pandoc/releases下载 `pandoc-3.7.0.2-windows-x86_64.zip` 放到目录 `pandoc` 中。

### Step 3: Install dependencies

In the project root directory, run:

```cmd
npm install
```

---

## Running the project 运行项目

1. Start the web development server (for debugging, accessible at `localhost:5173`):

```cmd
npm run dev
```

2. Then start the Electron desktop app:

```cmd
npm run electron
```

---

## Build and Packaging 打包发布

1. Build the web assets:

```cmd
npm run build
```

2. Modify `electron/electron-main.js`:

* Comment out the line that loads the URL:

  ```js
  // mainWindow.loadURL('http://localhost:5173');
  ```
* Uncomment or add the line to load the built files:

  ```js
  mainWindow.loadFile(path.join(__dirname, 'web-dist/index.html'));
  ```

3. Run the Electron app to enter production mode:

```cmd
npm run electron
```

4. To create a packaged installer for distribution, run:

```cmd
npm run dist
```