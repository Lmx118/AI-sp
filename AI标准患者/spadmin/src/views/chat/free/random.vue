<template>
  <div class="app-container">
    <div class="header">
      <h1>AI标准化病人系统</h1>
      <el-button type="primary" @click="fetchSessions">刷新会话</el-button>
    </div>
    
    <div class="card-container">
      <!-- 左侧：会话和预设病例 -->
      <el-card>
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>会话列表</span>
            <el-button type="primary" size="small" @click="fetchSessions">刷新</el-button>
          </div>
        </template>
        
        <div class="session-list">
          <div v-for="session in sessions" :key="session.session_id" 
            :class="['session-item', { 'active-session': session.session_id === activeSessionId }]"
            @click="selectSession(session.session_id)"
            style="padding: 10px; border-bottom: 1px solid #ebeef5; cursor: pointer;">
            <div><strong>{{ session.patient_name }}</strong></div>
            <div>诊断: {{ session.disease }}</div>
            <div>消息数: {{ session.message_count }}</div>
            <div>最后活动: {{ session.last_activity }}</div>
            <el-button size="mini" type="danger" @click.stop="deleteSession(session.session_id)">
              删除
            </el-button>
          </div>
          <div v-if="sessions.length === 0" style="text-align: center; padding: 20px; color: #909399;">
            暂无活跃会话
          </div>
        </div>
      </el-card>
      
      <!-- 中间：聊天区域 -->
      <el-card>
      <template #header>
        <div v-if="activeSession">
          <span>与 {{ activeSession.patient_name }} 对话 - {{ activeSession.disease }}</span>
        </div>
        <div v-else>
          <span>请选择或创建会话</span>
        </div>
      </template>
      
      <div class="chat-container">
        <div class="chat-messages">
          <div v-for="(msg, index) in chatMessages" :key="index" class="message-container">
            <div class="message user-message">
              <div><strong>医生:</strong> {{ msg.user_message }}</div>
              <div style="font-size: 12px; color: #909399;">{{ msg.timestamp }}</div>
            </div>
            <div class="message sp-message">
              <div><strong>患者:</strong> {{ msg.sp_response }}</div>
              <div style="font-size: 12px; color: #909399;">{{ msg.timestamp }}</div>
            </div>
          </div>
          <div v-if="chatMessages.length === 0" style="text-align: center; padding: 20px; color: #909399;">
            暂无对话记录
          </div>
        </div>
        
        <!-- 快速提问按钮 -->
        <div class="quick-buttons">
          <el-button 
            size="small" 
            :disabled="!activeSessionId" 
            @click="sendQuickQuestion('基本问诊', '您好，请问您哪里不舒服？')">
            基本问诊
          </el-button>
          <el-button 
            size="small" 
            :disabled="!activeSessionId" 
            @click="sendQuickQuestion('症状时间', '症状持续多长时间了？')">
            症状时间
          </el-button>
          <el-button 
            size="small" 
            :disabled="!activeSessionId" 
            @click="sendQuickQuestion('过敏史', '您有什么过敏史吗？')">
            过敏史
          </el-button>
          <el-button 
            size="small" 
            :disabled="!activeSessionId" 
            @click="sendQuickQuestion('家族史', '您的家族病史如何？')">
            家族史
          </el-button>
        </div>
        
        <el-input
          v-model="messageInput"
          placeholder="输入您的问题..."
          :disabled="!activeSessionId"
          @keyup.enter="sendMessage">
          <template #append>
            <el-button :disabled="!activeSessionId" @click="sendMessage">发送</el-button>
          </template>
        </el-input>
        
        <!-- 功能按钮 -->
        <div class="function-buttons">
          <el-button 
            type="primary" 
            size="small" 
            :disabled="!activeSessionId" 
            @click="requestExamReport">
            <i class="el-icon-document"></i> 请求检查报告
          </el-button>
          <el-button 
            type="success" 
            size="small" 
            :disabled="!activeSessionId" 
            @click="viewScoringReport">
            <i class="el-icon-data-analysis"></i> 查看评分报告
          </el-button>
        </div>
      </div>
    </el-card>
    </div>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 预设病例 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>预设病例</span>
          </template>
          
          <div class="preset-list">
            <el-table :data="presets" height="250">
              <el-table-column prop="name" label="姓名" width="100"></el-table-column>
              <el-table-column prop="disease" label="疾病" width="120"></el-table-column>
              <el-table-column prop="symptoms" label="症状">
                <template #default="scope">
                  {{ scope.row.symptoms.join(', ') }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button size="mini" @click="createSession(scope.row.filename)">使用</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      
      <!-- 自定义SP数据 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>自定义SP数据</span>
          </template>
          
          <el-input
            v-model="customSpData"
            type="textarea"
            :rows="6"
            placeholder="请输入SP数据（JSON格式）"
            style="margin-bottom: 10px;">
          </el-input>
          
          <el-button type="primary" @click="validateSpData">验证数据</el-button>
          <el-button type="success" @click="createRandomSession">随机创建会话</el-button>
          
          <div v-if="validationResult" style="margin-top: 15px;">
            <el-alert
              :title="validationResult.message"
              :type="validationResult.valid ? 'success' : 'error'"
              show-icon>
            </el-alert>
            
            <div v-if="validationResult.data_summary" style="margin-top: 10px;">
              <p><strong>患者姓名:</strong> {{ validationResult.data_summary.patient_name }}</p>
              <p><strong>疾病:</strong> {{ validationResult.data_summary.disease }}</p>
              <p><strong>症状数量:</strong> {{ validationResult.data_summary.symptoms_count }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 会话信息 -->
    <el-card style="margin-top: 20px;" v-if="activeSessionId">
      <template #header>
        <span>会话信息</span>
      </template>
      
      <el-descriptions :column="2" border v-if="sessionInfo.basics">
        <el-descriptions-item label="患者姓名">{{ sessionInfo.basics.name }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ sessionInfo.basics.age }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ sessionInfo.basics.gender }}</el-descriptions-item>
        <el-descriptions-item label="疾病">{{ sessionInfo.disease }}</el-descriptions-item>
        <el-descriptions-item label="症状" :span="2">
          {{ sessionInfo.symptoms.join(', ') }}
        </el-descriptions-item>
        <el-descriptions-item label="性格特点" :span="2" v-if="sessionInfo.personalities">
          {{ sessionInfo.personalities.join(', ') }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-else style="text-align: center; padding: 20px; color: #909399;">
        加载中...
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import axios from 'axios';

// 状态管理
const activeSessionId = ref(null);
const sessions = ref([]);
const presets = ref([]);
const chatMessages = ref([]);
const messageInput = ref('');
const sessionInfo = ref({
  basics: {
    name: '',
    age: '',
    gender: ''
  },
  disease: '',
  symptoms: [],
  personalities: []
});
const customSpData = ref(JSON.stringify({
  basics: {
    name: "患者姓名",
    age: 30,
    gender: "男"
  },
  disease: "疾病名称",
  symptoms: ["症状1", "症状2"],
  personalities: ["性格特点1"],
  hiddens: ["隐藏信息1"],
  examinations: ["检查项目1"]
}, null, 2));
const validationResult = ref(null);

// API基础URL
const apiBaseUrl = 'https://api.bwzhang.cn/api';

// 获取预设病例列表
const fetchPresets = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/sp/presets`);
    if (response.data.success) {
      presets.value = response.data.data;
      ElMessage.success(`获取到 ${presets.value.length} 个预设病例`);
    } else {
      ElMessage.error('获取预设病例失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取预设病例出错:', error);
    ElMessage.error('获取预设病例出错: ' + error.message);
  }
};

// 创建新会话
const createSession = async (presetFile = null) => {
  try {
    const sessionId = `${Date.now()}`;
    const payload = { session_id: sessionId };
    
    if (presetFile) {
      payload.preset_file = presetFile;
    } else {
      try {
        payload.custom_data = JSON.parse(customSpData.value);
      } catch (e) {
        ElMessage.error('自定义SP数据格式错误，必须是有效的JSON');
        return;
      }
    }
    
    const response = await axios.post(`${apiBaseUrl}/sp/session/create`, payload);
    
    if (response.data.success) {
      ElMessage.success('会话创建成功');
      await fetchSessions(); // 刷新会话列表
      activeSessionId.value = sessionId;
      await fetchSessionInfo(sessionId);
      chatMessages.value = []; // 清空聊天记录
    } else {
      ElMessage.error('创建会话失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('创建会话出错:', error);
    ElMessage.error('创建会话出错: ' + error.message);
  }
};

// 随机创建会话
const createRandomSession = async () => {
  if (presets.value.length === 0) {
    ElMessage.warning('暂无预设病例，请先获取预设病例');
    await fetchPresets();
    
    if (presets.value.length === 0) {
      ElMessage.error('无法获取预设病例，请检查网络连接');
      return;
    }
  }
  
  // 随机选择一个预设病例
  const randomIndex = Math.floor(Math.random() * presets.value.length);
  const randomPreset = presets.value[randomIndex];
  
  ElMessage.success(`已随机选择病例: ${randomPreset.name} - ${randomPreset.disease}`);
  await createSession(randomPreset.filename);
};

// 获取所有会话
const fetchSessions = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/sp/sessions`);
    if (response.data.success) {
      sessions.value = response.data.data.sessions;
    } else {
      ElMessage.error('获取会话列表失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取会话列表出错:', error);
    ElMessage.error('获取会话列表出错: ' + error.message);
  }
};

// 获取会话信息
const fetchSessionInfo = async (sessionId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/sp/session/${sessionId}/info`);
    if (response.data.success) {
      // 确保合并默认结构，避免undefined属性
      sessionInfo.value = {
        ...sessionInfo.value,
        ...response.data.data
      };
    } else {
      ElMessage.error('获取会话信息失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取会话信息出错:', error);
    ElMessage.error('获取会话信息出错: ' + error.message);
  }
};

// 获取聊天历史
const fetchChatHistory = async (sessionId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/sp/session/${sessionId}/history`);
    if (response.data.success) {
      chatMessages.value = response.data.data.history;
    } else {
      ElMessage.error('获取聊天历史失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取聊天历史出错:', error);
    ElMessage.error('获取聊天历史出错: ' + error.message);
  }
};

// 发送消息函数 (使用fetch API)
const sendMessage = async () => {
  if (!messageInput.value.trim() || !activeSessionId.value) {
    ElMessage.warning('请输入消息并选择会话');
    return;
  }

  try {
    const session_Id = String(activeSessionId.value);
    const response = await fetch(`${apiBaseUrl}/sp/session/${session_Id}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageInput.value
      })
    });

    const result = await response.json();

    if (result.success) {
      // 添加用户消息和SP回复到聊天记录
      chatMessages.value.push({
        user_message: messageInput.value,
        sp_response: result.data.sp_response,
        timestamp: new Date().toLocaleTimeString()
      });

      messageInput.value = ''; // 清空输入框

      // 自动滚动到底部
      setTimeout(() => {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } else {
      ElMessage.error('发送消息失败: ' + result.message);
    }
  } catch (error) {
    console.error('发送消息出错:', error);
    ElMessage.error('发送消息出错: ' + error.message);
  }
};

// 发送快速问题
const sendQuickQuestion = async (type, question) => {
  messageInput.value = question;
  await sendMessage();
};

// 请求检查报告
const requestExamReport = async () => {
  if (!activeSessionId.value) {
    ElMessage.warning('请先选择会话');
    return;
  }

  try {
    const session_Id = String(activeSessionId.value);
    const response = await fetch(`${apiBaseUrl}/sp/session/${session_Id}/exam_report`, {
      method: 'Get'
      
    });

    const result = await response.json();
    if (result.success) {
      // 将检查报告添加到聊天记录
      chatMessages.value.push({
        user_message: "请求检查报告",
        sp_response: JSON.stringify(result.data, null, 2),
        timestamp: new Date().toLocaleTimeString()
      });

      ElMessage.success('检查报告获取成功');
    } else {
      ElMessage.error('获取检查报告失败: ' + result.message);
    }
  } catch (error) {
    console.error('获取检查报告出错:', error);
    ElMessage.error('获取检查报告出错: ' + error.message);
  }
};

// 查看评分报告
const viewScoringReport = async () => {
  if (!activeSessionId.value) {
    ElMessage.warning('请先选择会话');
    return;
  }

  try {
    const session_Id = String(activeSessionId.value);
    const response = await fetch(`${apiBaseUrl}/scoring/report/${session_Id}`, {
      method: 'GET', 
    });
    const scoreSummary = await fetch(`${apiBaseUrl}/scoring/summary/${session_Id}`, {
      method: 'GET', 
    });
    
    const result = await response.json();
    const summary = await scoreSummary.json();

    if (result.success) {
      const data = summary.data;
      let output = '';

      // 问诊统计
      output += `    已问问题数量: ${data.asked_questions}\n`;
      output += `    已问问题权重: ${data.asked_weight}\n\n`;

      // 分类统计
      const general = data.category_stats.general;
      output += `    已问问题数量: ${general.asked_questions}\n`;
      output += `    已问问题权重: ${general.asked_weight}\n`;
      output += `    完成率: ${general.completion_rate}%\n`;
      output += `    总问题数: ${general.total_questions}\n`;
      output += `    总权重: ${general.total_weight}\n\n`;

      // 评价信息
      output += `    评语: ${data.evaluation.comment}\n`;
      output += `    等级: ${data.evaluation.level}\n\n`;

      // 总体统计
      output += `    完成百分比: ${data.percentage}%\n`;
      output += `    总问题数: ${data.total_questions}\n`;
      output += `    总得分: ${data.total_score}\n`;
      output += `    总权重: ${data.total_weight}`;
      
      chatMessages.value.push({
        user_message: "查看评分报告",
        sp_response: output,
        timestamp: new Date().toLocaleTimeString()
      });

      ElMessage.success('评分报告获取成功');
    } else {
      ElMessage.error('获取评分报告失败: ' + result.message);
    }
  } catch (error) {
    console.error('获取评分报告出错:', error);
    ElMessage.error('获取评分报告出错: ' + error.message);
  }
};

// 删除会话
const deleteSession = async (sessionId) => {
  try {
    const response = await axios.delete(`${apiBaseUrl}/sp/session/${sessionId}`);
    
    if (response.data.success) {
      ElMessage.success('会话删除成功');
      if (activeSessionId.value === sessionId) {
        activeSessionId.value = null;
        chatMessages.value = [];
        sessionInfo.value = {};
      }
      await fetchSessions(); // 刷新会话列表
    } else {
      ElMessage.error('删除会话失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('删除会话出错:', error);
    ElMessage.error('删除会话出错: ' + error.message);
  }
};

// 验证SP数据
const validateSpData = async () => {
  try {
    const data = JSON.parse(customSpData.value);
    const response = await axios.post(`${apiBaseUrl}/sp/data/validate`, data);
    
    if (response.data.success) {
      validationResult.value = response.data.data;
      ElMessage.success('SP数据验证成功');
    } else {
      ElMessage.error('SP数据验证失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('验证SP数据出错:', error);
    ElMessage.error('验证SP数据出错: ' + error.message);
  }
};

// 选择会话
const selectSession = async (sessionId) => {
  activeSessionId.value = sessionId;
  await fetchSessionInfo(sessionId);
  await fetchChatHistory(sessionId);
};

// 初始化
onMounted(() => {
  fetchPresets();
  fetchSessions();
});

// 计算属性
const activeSession = computed(() => {
  return sessions.value.find(s => s.session_id === activeSessionId.value);
});
</script>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.card-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
}

.message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
}

.user-message {
  background-color: #ecf5ff;
  text-align: right;
}

.sp-message {
  background-color: #f2f6fc;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.quick-buttons .el-button {
  flex: 1;
  min-width: 120px;
}

.function-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.session-list {
  max-height: 400px;
  overflow-y: auto;
}

.active-session {
  background-color: #ecf5ff;
}

.preset-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>