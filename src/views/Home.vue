<!-- ./src/views/Home.vue -->
<template>
  <div class="container">
    <div class="top-box" tabindex="-1"
      @paste="handlePaste"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ 'is-dragging': isDragging }">
      <div class="paste-box" :class="{ 'is-pasted': imageLoaded, 'no-pasted': !imageLoaded }">
        按Ctrl+V粘贴图像到此处📋<br>或者将图像拖动到此处粘贴
      </div>
      <div v-if="imageLoaded" class="img-box">
        <img :src="imageData" alt="Pasted image" @click="openInNewWindow" draggable="false"/>
      </div>
    </div>

    <div class="middle-box">
      <div class="text-area">
        <textarea ref="myTextarea" placeholder="请在上方粘贴图片以进行推理" v-model="inputText"></textarea>
      </div>
      <div class="render-area">
          <div ref="mathjax" v-html="inputText" class="mathjax-container"></div>
      </div>
    </div>

    <div class="bottom-box">
      <a href="#" class="office-btn" title="在Word(WPS/Microsoft)中打开" @click.prevent="saveLatex">
        <img src="@/assets/office_word.png" width="19" height="19"/>
      </a>
      <a href="#" class="copy-btn" title="复制识别内容到剪贴板">
        <img src="@/assets/copy.png" width="18" height="20"/>
      </a>
      <a href="#" class="clearImg-btn" title="清除图片" @click.prevent="reset">
        <img src="@/assets/clear_img.png" width="20" height="20"/>
      </a>
      <a href="#" class="clearText-btn" title="清除文本" @click.prevent="clearTextarea">
        <img src="@/assets/clear_text.png" width="20" height="20"/>
      </a>
      <div class="menu-wrapper" 
          @mouseenter="handleWrapperMouseEnter" 
          @mouseleave="handleWrapperMouseLeave">
        <div class="menu-button" role="button" tabindex="0" @click="openDocxFolder">
          <div>Docx文件夹</div>
        </div>
        <div v-if="unfolded" class="dropup-menu">
          <div class="menu-item" @click="handleAction">清除文件</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  created() {
    this.fetchBackendUrl();
  },
  data() {
    return {
      backendUrl: window.backendAddr,
      inputText: window.initText,
      imageLoaded: window.imageLoaded, // 控制显示粘贴提示还是图片
      imageData: window.imageData, // 存储图片的 Data URL (Base64)
      isDragging: false,   // 用于拖放时的视觉反馈
      inferenceCount: 0, // 用于计数推理次数
      unfolded: false, // 用于控制菜单按钮的展开状态
      menuHoverTimer: null, // 用于存储 setTimeout 的 ID
    };
  },
  mounted() {
    this.renderMath();
  },
  updated() {
    this.renderMath();
  },
  watch: {
    inputText(newVal) {
      window.initText = newVal; // 手动同步到全局
    },
    imageLoaded(newVal) {
      window.imageLoaded = newVal; 
    },
    imageData(newVal) {
      window.imageData = newVal;
    },
    inferenceCount() {
      if (this.backendUrl) {
        this.uploadImageData(this.imageData).then(() => {
          this.startStream().then(() => {
            this.finalDecode();
          });
        });
      }
    },
  },
  methods: {
    async finalDecode() {
      if (this.inputText.includes("推理异常，停止推理") || !this.backendUrl) return;
      this.inputText = '';
      try {
        const response = await fetch(this.backendUrl + '/final_decode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const text = await response.text();
        this.inputText = text;

      } catch (error) {
        this.inputText = `请求失败: ${error}`;
      } finally {
      }
    },
    async startStream() {
      if (!this.backendUrl) {
        this.inputText = '后端地址未设置，请稍后再试。';
        return;
      }
      this.inputText = '';

      const response = await fetch(this.backendUrl + '/stream_inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok || !response.body) {
        this.inputText = '请求失败或没有返回体';
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const text = line.replace(/^data:\s*/, '');
            this.inputText += text;
          }
        }
      }
    },
    // base64 → Blob → File → FormData → POST
    async uploadImageData(base64Data) {
      if (!base64Data || !this.backendUrl) {
        console.warn('No image data or backend URL available.');
        return;
      }

      const blob = this.base64ToBlob(base64Data);
      const file = new File([blob], "pasted.png", { type: "image/png" });

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(this.backendUrl + '/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.text(); // 你也可以改成 .json() 看你后端返回格式
        console.log("Upload response:", response.status, result);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    },

    base64ToBlob(base64) {
      const byteString = atob(base64.split(',')[1]); // 去掉 data:image/...;base64,
      const mimeString = base64.split(',')[0].match(/:(.*?);/)[1];

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type: mimeString });
    },

    // 读取图片文件并更新组件状态 (已有的逻辑，基本正确)
    processImageFile(file) {
      if (!file || !file.type.startsWith('image/')) {
        console.warn('Provided file is not an image.');
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        this.imageData = e.target.result; // Data URL
        this.imageLoaded = true;
        this.inferenceCount += 1; // 增加推理次数
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('读取图片失败。');
        this.reset();
      };

      reader.readAsDataURL(file);
    },

    async fetchBackendUrl(retryCount = 0) {
      if (this.backendUrl) return;

      this.inputText = '正在加载推理模型...';
      window.electron.getBackendUrl().then(url => {
        if (url) {
          this.backendUrl = url;
          window.backendAddr = this.backendUrl; // 同步到全局变量
          this.inputText = "推理模型加载完成";
        } else {
          setTimeout(() => {
            if (retryCount < 50) {
              this.fetchBackendUrl(retryCount + 1); // 继续重试
            } else {
              console.warn('❌ 获取后端地址失败，已重试多次');
            }
          }, 800);
        }
      });
    },

    // 处理粘贴事件 (已有的逻辑，基本正确)
    handlePaste(event) {
      event.preventDefault(); // 阻止默认粘贴行为

      const clipboardData = event.clipboardData || event.originalEvent.clipboardData;

      if (clipboardData && clipboardData.items) {
        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];

          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              this.processImageFile(file);
              break; // 处理第一个找到的图片文件
            }
          }
          // 也可以处理 data URI 文本，但通常粘贴图片直接是 file item (已注释)
        }
      } else {
          console.log('No clipboard data or items found or supported.');
          alert('无法获取粘贴板数据，请确保粘贴的是图片。');
      }
    },

    // 处理拖动经过区域事件
    handleDragOver(event) {
      // event.preventDefault(); // 在模板中使用了 .prevent 修饰符
      console.log('Drag over detected.');
      this.isDragging = true; // 改变状态以提供视觉反馈
    },

    // 处理拖动离开区域事件
    handleDragLeave(event) {
       // 只有当拖动离开真正的主容器时才改变状态
       // 否则，如果拖动进入子元素，会错误地触发 leave
       const relatedTarget = event.relatedTarget;
       if (!this.$el.contains(relatedTarget)) {
         console.log('Drag leave detected.');
         this.isDragging = false; // 移除视觉反馈
       }
    },

    // 处理文件放置事件
    handleDrop(event) {
      // event.preventDefault(); // 在模板中使用了 .prevent 修饰符
      this.isDragging = false; // 移除视觉反馈

      const dataTransfer = event.dataTransfer;

      if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
        // 获取拖放的第一个文件
        const file = dataTransfer.files[0];

        // 检查文件类型是否是图片
        if (file.type.startsWith('image/')) {
          this.processImageFile(file); // 处理图片文件
        } else {
          alert('请拖放一个图片文件。');
        }
      } else {
        console.log('No files dropped.');
        alert('无法获取拖放的文件数据，请确保拖放的是图片。');
      }
    },

    // 重置组件状态，清空图片并显示提示 (已有的逻辑，基本正确)
    reset() {
      this.imageLoaded = false;
      this.imageData = null;
      console.log('Component state reset.');
    },

    async openInNewWindow() {
      if (!this.imageData) {
        console.warn('No image data to open!');
        return;
      }
      try {
        const result = await window.electron.openImageWindow(this.imageData);
      } catch (error) {
        console.error('Error calling openImageWindow:', error);
      }
    },

    clearTextarea() {
      this.$refs.myTextarea.value = '';
      this.inputText = '';
    },

    copyTextarea() {
      const textarea = this.$refs.myTextarea;
      if (textarea) {
        navigator.clipboard.writeText(textarea.value)
          .then(() => {
            // 复制成功
            console.log('已复制到剪贴板');
          })
          .catch(err => {
            // 如果 Clipboard API 不可用再降级用 execCommand
            textarea.select();
            document.execCommand('copy');
          });
      }
    },

    renderMath() {
      const el = this.$refs.mathjax;
      let textContent = el.textContent;
      textContent = textContent.replace(/\n/g, "<br>");
      textContent = textContent.replace(/\\\[\n/g, "\\[");
      el.innerHTML = textContent;

      if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([el])
      }
    },

    async saveLatex() {
      const filename = "output";
      const content = `\\documentclass{article}
\\usepackage[UTF8]{ctex}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{fontspec}           
\setmainfont{Microsoft YaHei}
\\usepackage{unicode-math}       
\\setmathfont{Cambria Math}
\\begin{document}

${this.inputText}

\\end{document}`;
      try {
        const result = await window.electron.texToDocx(filename, content);
        console.log(result);
      } catch (err) {
        console.error(err);
        alert("❌ 转换失败：" + err.message);
      }

    },
    handleWrapperMouseEnter() {
      // 当鼠标进入 menu-wrapper (无论是按钮还是已展开的菜单)
      if (this.menuHoverTimer) {
        clearTimeout(this.menuHoverTimer); // 清除可能存在的关闭计时器
        this.menuHoverTimer = null;
      }
      this.unfolded = true; // 打开或保持菜单展开
    },
    handleWrapperMouseLeave() {
      // 当鼠标离开 menu-wrapper
      // 启动一个延时关闭计时器
      this.menuHoverTimer = setTimeout(() => {
        this.unfolded = false;
      }, 150); // 250毫秒的延迟，可以根据手感调整
    },
    handleAction() {
      this.unfolded = false; // 点击菜单项后立即关闭菜单
      if (this.menuHoverTimer) { // 清除任何可能存在的关闭计时器
        clearTimeout(this.menuHoverTimer);
        this.menuHoverTimer = null;
      }

      // ✅ 正确调用异步方法
      window.electron.clearSaveFolder()
        .then(result => {
          if (!result) {
            console.log("🚫 用户取消了清除或操作失败");
          }
        })
        .catch(err => {
          console.error("❌ 清除文件失败：", err);
        });
    },

    openDocxFolder() {
      // 这里可以调用 Electron 的方法打开文件夹
      window.electron.openDocxFolder()
        .then(() => {})
        .catch(err => {
          console.error('打开文件夹失败:', err);
        });
    },
  }
};
</script>

<style src="./Home.css"></style>