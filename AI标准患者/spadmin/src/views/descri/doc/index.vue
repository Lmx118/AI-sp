<template>
  <div class="instruction-container">
    <header class="header">
      <h1><i class="icon-stethoscope"></i> AI标准化患者问诊教学系统</h1>
      <p>提升医学生问诊技巧与临床推理能力的智能教学平台</p>
    </header>

    <main class="main-content">
      <section class="instruction-section">
        <h2><i class="icon-info"></i> 使用说明</h2>
        <div class="instruction-content">
          <h3>自由对话</h3>
          <p>用户可通过点击左侧菜单栏-对话-自由对话，进入自由对话界面进行练习。</p>

          <p>在自由对话模式，用户进入对话界面后，系统会从案例库中随机挑选一个案例，并扮演这个标准化患者。用户需要通过询问标准化患者相关问题进行问诊。</p>
          
          <p>如果需要体格检查，可输入相关指令，如：<strong>我现在需要测量你的血压和脉搏。</strong>系统会回复体格检查的结果。</p>
          
          <p>如果需要辅助检查，可输入指令，让患者做相关检查，如：<strong>你先去做个心脏彩超。</strong>患者会回复相关辅助检查的结果。</p>
          
          <p>用户在问诊结束时需要给出详细的诊断说明，而后系统会对整个对话流程按照病史采集完整性、医学逻辑性评估、沟通与人文关怀进行评分。</p>
          
          <h3>案例选择</h3>

          <p>用户也可通过点击左侧菜单栏-对话-案例选择，进入案例库选择案例进行练习。</p>
        </div>
      </section>
      
      <section class="declaration-section">
        <h2><i class="icon-document"></i> 使用声明</h2>
        <div class="declaration-content">
          <ul>
            <li>本系统为教育工具，非医疗诊断设备</li>
            <li>所有病例均为教学案例</li>
            <li>不替代真实医患沟通与临床决策</li>
            <li>用户对话数据经脱敏处理，符合GDPR/HIPAA规范</li>
          </ul>
        </div>
      </section>
      
      
    </main>

  </div>
</template>

<script>
export default {
  name: 'InstructionPage',
  methods: {
    startSystem() {
      // 实际应用中这里可以跳转到主页面
      this.$emit('start-system');
      alert('正在进入医学问诊教学系统...');
    }
  }
}
</script>

<style lang="less" scoped>
.instruction-container {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #2c3e50;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  background: linear-gradient(90deg, #3498db 0%, #2c3e50 100%);
  color: white;
  padding: 25px 30px;
  text-align: center;
  border-radius: 10px 10px 0 0;
  margin-bottom: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 28px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 i {
  margin-right: 15px;
  font-size: 32px;
}

.header p {
  opacity: 0.9;
  font-size: 16px;
}

.main-content {
  background: white;
  padding: 30px;
  flex: 1;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.instruction-section, .declaration-section {
  margin-bottom: 35px;
}

h2 {
  color: #2c3e50;
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eaecef;
  display: flex;
  align-items: center;
}

h2 i {
  margin-right: 10px;
  color: #3498db;
  font-size: 26px;
}

.instruction-content {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.instruction-content p {
  margin-bottom: 15px;
  line-height: 1.8;
}

.declaration-content {
  background: #f1f8ff;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #d0e5f0;
}

.declaration-content ul {
  list-style-type: none;
  padding: 0;
}

.declaration-content li {
  margin-bottom: 15px;
  padding-left: 30px;
  position: relative;
  line-height: 1.6;
}

.declaration-content li:before {
  content: "•";
  color: #3498db;
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
  font-size: 18px;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

button {
  padding: 14px 40px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  background: linear-gradient(90deg, #2980b9 0%, #3498db 100%);
}

.footer {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-size: 14px;
  margin-top: 20px;
}

/* 图标样式 */
.icon-stethoscope:before {
  content: "⚕";
  font-size: 32px;
}

.icon-info:before {
  content: "ℹ";
}

.icon-document:before {
  content: "📄";
}

@media (max-width: 768px) {
  .instruction-container {
    padding: 10px;
  }
  
  .header {
    padding: 20px;
  }
  
  .header h1 {
    font-size: 24px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  button {
    width: 100%;
    padding: 16px;
  }
}
</style>