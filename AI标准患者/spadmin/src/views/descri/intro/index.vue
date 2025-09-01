<template>
  <div class="overview-container">
    <header class="page-header">
      <h1>AI标准化患者</h1>
      <p class="subtitle">基于大语言模型的虚拟患者模拟系统</p>
    </header>
    
    <main class="content">
      <section class="intro-section">
        <div class="text-content">
          <p class="description">
            “AI标准化患者”是由大语言模型（LLM）驱动的虚拟患者模拟系统，专为医学生、住院医师及临床工作者设计。通过自然语言对话，用户可沉浸式演练全流程病史采集，系统实时生成患者个性化反馈，并在问诊结束后提供多维能力评分，帮助快速定位薄弱环节，实现诊疗能力的科学进阶。
          </p>
        </div>
        <div class="visual-content">
          <div class="ai-illustration">
            <div class="doctor-icon">🤖</div>
            <div class="chat-bubbles">
              <div class="bubble patient">我最近胸口有点疼...</div>
              <div class="bubble doctor">这种疼痛持续多久了？</div>
            </div>
            <div class="ai-patient-icon">👨‍⚕️</div>
          </div>
        </div>
      </section>
      
      <section class="features-section">
        <h2>核心功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>自然语言对话</h3>
            <p>使用先进的大语言模型技术，实现与虚拟患者的自然流畅对话</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>实时反馈</h3>
            <p>在问诊过程中获取即时个性化反馈，及时调整问诊策略</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>多维评分</h3>
            <p>问诊结束后获得全面能力评估，精准定位薄弱环节</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>科学进阶</h3>
            <p>基于评估结果制定个性化学习路径，实现诊疗能力系统提升</p>
          </div>
        </div>
      </section>
      
      <section class="cta-section">
        <h2>注意</h2>
        <p>在开始练习之前请先阅读使用说明</p>
        <button class="cta-button" @click="startExperience">立即了解</button>
      </section>
    </main>
  </div>
</template>

<script setup>
// 这里可以使用Vue 3的Composition API
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import {useStore} from "vuex"
const store=useStore()

const props=defineProps(['menuData','index'])

const router = useRouter();
// 可以添加响应式数据或方法
const startExperience = () => {
    store.commit('addMenu',{ id: '2', name: '使用说明', icon: 'Menu', path: '/descri/doc', describe: '项目使用说明' })
    router.push('/descri/doc')
}
</script>

<style lang="less" scoped>
.overview-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Arial', sans-serif;
  color: #333;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.intro-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 4rem;
  align-items: center;
}

.text-content {
  flex: 1;
  min-width: 300px;
}

.description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #34495e;
}

.visual-content {
  flex: 1;
  min-width: 300px;
  display: flex;
  justify-content: center;
}

.ai-illustration {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.doctor-icon, .ai-patient-icon {
  font-size: 3rem;
}

.chat-bubbles {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bubble {
  padding: 0.8rem 1.2rem;
  border-radius: 20px;
  max-width: 200px;
  font-size: 0.9rem;
}

.bubble.patient {
  background-color: #e3f2fd;
  align-self: flex-start;
  border-bottom-left-radius: 5px;
}

.bubble.doctor {
  background-color: #e8f5e9;
  align-self: flex-end;
  border-bottom-right-radius: 5px;
}

.features-section {
  margin-bottom: 4rem;
}

.features-section h2 {
  text-align: center;
  margin-bottom: 2.5rem;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.5;
}

.cta-section {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.cta-section h2 {
  margin-bottom: 1rem;
}

.cta-section p {
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .overview-container {
    padding: 1rem;
  }
  
  .intro-section {
    flex-direction: column;
  }
  
  .ai-illustration {
    flex-direction: column;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>