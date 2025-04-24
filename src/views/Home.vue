<template>
  <div class="container">
    <div class="shadow-box" id="drop-zone">
      <p>📋点击此处粘贴图像<br>或者将图像拖动到此处粘贴</p>
    </div>
    <div class="text-area">
      <textarea placeholder="Enter multiple lines of text..."></textarea>
    </div>
    <div class="blank-box"></div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;               /* 水平占满 */
  gap: 5px;             /* 间距 */
  margin-top: 5px;
  margin-right: 5px;
  display: flex;
  flex-direction: column;     /* 垂直排列 */
  height: 100%;              /* 占满整个视口高度 */
  justify-content: center;    /* 垂直居中 */
  align-items: center;        /* 水平居中 */
}

.shadow-box {
  width: 100%;               /* 水平占满 */
  flex: 1;                    /* 占用剩余空间的比例（等价于 height: 50%） */
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  box-sizing: border-box;
  display: flex;              /* 激活 Flexbox */
  justify-content: center;    /* 水平居中 */
  align-items: center;        /* 垂直居中 */
  cursor: pointer;
  font-size: 18px;
  text-align: center;
}

#drop-zone img {
  margin-top: 1rem;
  max-width: 100%;
  max-height: 200px;
}

.text-area {
  width: 100%;               /* 水平占满 */
  flex: 1;                    /* 占用剩余空间的比例（等价于 height: 50%） */
  box-sizing: border-box;
  display: flex;              /* 激活 Flexbox */
  justify-content: center;    /* 水平居中 */
  align-items: center;        /* 垂直居中 */
}

.text-area textarea {
  width: 100%;                /* 水平占满 */
  height: 100%;               /* 垂直占满 */
  border: 1px solid #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 15px;
  resize: none;               /* 禁止调整大小 */
  padding: 0.3rem;
  box-sizing: border-box;     /* 确保内边距在总高度内 */
  transition: all 0.35s ease;   /* ⭐ 平滑过渡效果 */
}

.text-area textarea:focus {
  outline: none;              /* 去掉默认的蓝色边框 */
  border: 1px solid lightblue; /* 聚焦时的边框颜色 */
  box-shadow: 0 0 5px rgba(0, 122, 204, 0.5); /* 聚焦时的阴影效果 */
}

.blank-box {
  width: 100%;               /* 水平占满 */
  height: 40px;              /* 占满剩余空间 */
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  box-sizing: border-box;
}
</style>

<script>
// Vue 页面脚本区域
export default {
  name: "Home",

  mounted() {
    // 当页面加载完成后，执行拖拽/粘贴功能绑定
    const dropZone = document.getElementById('drop-zone');

    // 粘贴事件（Ctrl + V）
    document.addEventListener('paste', (event) => {
      const items = event.clipboardData.items;
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          this.displayImage(file); // 用 this 调用下面的函数
          break;
        }
      }
    });

    // 拖拽相关事件
    dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropZone.style.borderColor = '#007bff';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '#aaa';
    });

    dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropZone.style.borderColor = '#aaa';

      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.displayImage(file); // 调用函数
      }
    });
  },

  methods: {
    // 显示图片的方法
    displayImage(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dropZone = document.getElementById('drop-zone');
        dropZone.innerHTML = `<img src="${event.target.result}" alt="pasted image" />`;
      };
      reader.readAsDataURL(file); // 把文件转为 base64 图片
    }
  }
};
</script>
