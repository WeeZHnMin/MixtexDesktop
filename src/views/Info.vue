<!-- /src/views/Info.vue -->
<template>
  <div class="container">
    <img src="@/assets/icon.png" alt="Logo" />
    <h3>推理模型作者:&nbsp;&nbsp;lrq</h3>
    <a href="https://github.com/RQLuo/MixTeX-Latex-OCR" target="_blank"> <img
        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub logo" width="24"
        height="24" style="vertical-align:text-bottom; ">Github</a>
    <a href="https://huggingface.co/MixTex/base_ZhEn" target="_blank">
      <img src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg" alt="Hugging Face logo" width="20"
        height="20" style="vertical-align: text-bottom;">Huggingface</a>
    <p>模型部署: wzmmmm</p>
    <a href="https://github.com/WeeZHnMin/MixtexDesktop" target="_blank"> <img
        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub logo" width="24"
        height="24" style="vertical-align:text-bottom; ">部署仓库</a>
    <p>欢迎在Github issue上反馈问题</p>
  </div>
</template>
  
<script>
export default {
  methods: {
    handleLinkClick(event) {
      const target = event.target.closest('a[href]')
      if (target && target.target === '_blank') {
        event.preventDefault()
        if (window.electronAPI && window.electronAPI.openExternal) {
          window.electronAPI.openExternal(target.href)
        } else {
          window.open(target.href, '_blank')
        }
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleLinkClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleLinkClick)
  }
}
</script>
  
<style scoped>
.container {
width: 100%;               /* 水平占满 */
height: 100%;
margin-top: 5px;
margin-right: 5px;
display: flex;
flex-direction: column;     /* 垂直排列 */
justify-content: center;    /* 垂直居中 */
align-items: center;        /* 水平居中 */
border-radius: 0.5rem;
background-color: white;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

h3 {
  color: #007acc;
}

p {
  justify-content: center;    /* 垂直居中 */
  align-items: center;        /* 水平居中 */
}
</style>
