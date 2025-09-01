<template>
  <div class="history-container">
    <div class="header">
      <h1><i class="icon-history"></i> 练习历史记录</h1>
      <p>查看您的问诊练习记录和成绩</p>
    </div>

    <div class="controls">
      <div class="search-box">
        <input type="text" placeholder="搜索会话ID或疾病类型..." v-model="searchQuery">
        <i class="icon-search">🔍</i>
      </div>
      <div class="filter-group">
        <select v-model="diseaseFilter">
          <option value="">所有疾病类型</option>
          <option v-for="disease in diseaseTypes" :key="disease" :value="disease">{{ disease }}</option>
        </select>
        <select v-model="timeFilter">
          <option value="">所有时间</option>
          <option value="today">今天</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span style="margin-left: 10px;">加载中...</span>
      </div>
      
      <table v-else class="history-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :class="column.key">
              {{ column.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td class="case-id">{{ record.sessionId }}</td>
            <td class="disease-type">{{ record.diseaseType || '未知' }}</td>
            <td class="time">{{ formatDate(record.createdAt) }}</td>
            <td class="duration">{{ record.duration || '未知' }}</td>
            <td class="score">
              <span :class="getScoreClass(record.score)">{{ record.score || '无' }}</span>
            </td>
            <td class="actions">
              <button class="detail-btn" @click="viewDetails(record)">详情</button>
              <button class="detail-btn" @click="viewReport(record)" style="margin-left: 5px;">报告</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!loading && filteredRecords.length === 0" class="no-data">
        <i class="icon-no-data">📝</i>
        <p>暂无历史记录</p>
      </div>
    </div>

    <!-- 详情对话框 -->
    <div v-if="showDetailDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="detail-dialog">
        <div class="dialog-header">
          <h2>会话详情 - {{ selectedRecord.sessionId }}</h2>
          <button class="close-btn" @click="closeDialog">&times;</button>
        </div>
        <div class="dialog-content">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>会话ID：</label>
                <span>{{ selectedRecord.sessionId }}</span>
              </div>
              <div class="detail-item">
                <label>疾病类型：</label>
                <span>{{ selectedRecord.diseaseType || '未知' }}</span>
              </div>
              <div class="detail-item">
                <label>创建时间：</label>
                <span>{{ formatDate(selectedRecord.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <label>用时：</label>
                <span>{{ selectedRecord.duration || '未知' }}</span>
              </div>
              <div class="detail-item">
                <label>得分：</label>
                <span :class="getScoreClass(selectedRecord.score)">{{ selectedRecord.score || '无' }}</span>
              </div>
              <div class="detail-item">
                <label>状态：</label>
                <span>{{ selectedRecord.status || '未知' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="sessionInfo">
            <h3>会话信息</h3>
            <div class="detail-grid">
              <div class="detail-item" v-for="(value, key) in sessionInfo" :key="key">
                <label>{{ key }}：</label>
                <span>{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-primary" @click="closeDialog">关闭</button>
        </div>
      </div>
    </div>

    <!-- 报告对话框 -->
    <div v-if="showReportDialog" class="dialog-overlay" @click.self="closeReportDialog">
      <div class="detail-dialog">
        <div class="dialog-header">
          <h2>评分报告 - {{ selectedRecord.sessionId }}</h2>
          <button class="close-btn" @click="closeReportDialog">&times;</button>
        </div>
        <div class="dialog-content">
          <div class="detail-section">
            <h3>评分详情</h3>
            <div class="report-content">
              {{ reportContent }}
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-primary" @click="closeReportDialog">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElIcon, ElLoading } from 'element-plus';
import axios from 'axios';

const apiBaseUrl = 'https://api.bwzhang.cn/api';

const searchQuery = ref('');
const diseaseFilter = ref('');
const timeFilter = ref('');
const showDetailDialog = ref(false);
const showReportDialog = ref(false);
const selectedRecord = ref(null);
const sessions = ref([]);
const sessionInfo = ref(null);
const reportContent = ref('');
const loading = ref(true);

const columns = [
  { key: 'sessionId', title: '会话ID' },
  { key: 'diseaseType', title: '疾病类型' },
  { key: 'time', title: '时间' },
  { key: 'duration', title: '用时' },
  { key: 'score', title: '得分' },
  { key: 'actions', title: '' }
];

// 获取所有会话
const fetchSessions = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${apiBaseUrl}/sp/sessions`);
    if (response.data.success) {
      sessions.value = response.data.data.sessions;
    } else {
      ElMessage.error('获取会话列表失败: ' + response.data.message);
    }
  } catch (error) {
    console.error('获取会话列表出错:', error);
    ElMessage.error('获取会话列表出错: ' + error.message);
  } finally {
    loading.value = false;
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

// 获取评分报告
const fetchScoringReport = async (sessionId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/scoring/report/${sessionId}`);
    const scoreSummary = await axios.get(`${apiBaseUrl}/scoring/summary/${sessionId}`);
    
    if (response.data.success && scoreSummary.data.success) {
      const data = scoreSummary.data.data;
      let output = '';

      // 问诊统计
      output += `已问问题数量: ${data.asked_questions}\n`;
      output += `已问问题权重: ${data.asked_weight}\n\n`;

      // 分类统计
      if (data.category_stats && data.category_stats.general) {
        const general = data.category_stats.general;
        output += `已问问题数量: ${general.asked_questions}\n`;
        output += `已问问题权重: ${general.asked_weight}\n`;
        output += `完成率: ${general.completion_rate}%\n`;
        output += `总问题数: ${general.total_questions}\n`;
        output += `总权重: ${general.total_weight}\n\n`;
      }

      // 评价信息
      if (data.evaluation) {
        output += `评语: ${data.evaluation.comment}\n`;
        output += `等级: ${data.evaluation.level}\n\n`;
      }

      // 总体统计
      output += `完成百分比: ${data.percentage}%\n`;
      output += `总问题数: ${data.total_questions}\n`;
      output += `总得分: ${data.total_score}\n`;
      output += `总权重: ${data.total_weight}`;
      
      reportContent.value = output;
    } else {
      ElMessage.error('获取评分报告失败');
    }
  } catch (error) {
    console.error('获取评分报告出错:', error);
    ElMessage.error('获取评分报告出错: ' + error.message);
  }
};

const diseaseTypes = computed(() => {
  return [...new Set(sessions.value.map(session => session.diseaseType))].filter(Boolean);
});

const filteredRecords = computed(() => {
  let filtered = sessions.value;
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(record => 
      record.sessionId.toLowerCase().includes(query) || 
      (record.diseaseType && record.diseaseType.toLowerCase().includes(query))
    );
  }
  
  // 疾病类型过滤
  if (diseaseFilter.value) {
    filtered = filtered.filter(record => record.diseaseType === diseaseFilter.value);
  }
  
  // 时间过滤
  if (timeFilter.value) {
    const now = new Date();
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.createdAt);
      
      switch (timeFilter.value) {
        case 'today':
          return recordDate.toDateString() === now.toDateString();
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          return recordDate >= weekStart;
        case 'month':
          return recordDate.getMonth() === now.getMonth() && 
                 recordDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }
  
  return filtered;
});

const getScoreClass = (score) => {
  if (!score) return 'score-low';
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-medium';
  return 'score-low';
};

const formatDate = (dateString) => {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const viewDetails = async (record) => {
  selectedRecord.value = record;
  await fetchSessionInfo(record.sessionId);
  showDetailDialog.value = true;
};

const viewReport = async (record) => {
  selectedRecord.value = record;
  await fetchScoringReport(record.sessionId);
  showReportDialog.value = true;
};

const closeDialog = () => {
  showDetailDialog.value = false;
  sessionInfo.value = null;
};

const closeReportDialog = () => {
  showReportDialog.value = false;
  reportContent.value = '';
};

onMounted(() => {
  fetchSessions();
});
</script>

<style scoped>
.history-container {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header p {
  color: #7f8c8d;
  font-size: 16px;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 80%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter-group select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  background-color: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.history-table td {
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.history-table tr:last-child td {
  border-bottom: none;
}

.history-table tr:hover {
  background-color: #f8f9fa;
}

.case-id {
  font-weight: 600;
  color: #3498db;
}

.disease-type {
  color: #2c3e50;
}

.time {
  color: #7f8c8d;
}

.duration {
  color: #7f8c8d;
}

.score span {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.score-high {
  color: #27ae60;
  background-color: #e8f5e9;
}

.score-medium {
  color: #f39c12;
  background-color: #fff8e1;
}

.score-low {
  color: #e74c3c;
  background-color: #ffebee;
}

.detail-btn {
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.detail-btn:hover {
  background-color: #2980b9;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.detail-dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.dialog-header h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.dialog-content {
  padding: 20px;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 18px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.detail-item span {
  color: #2c3e50;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.score-item label {
  width: 180px;
  font-weight: 600;
  color: #7f8c8d;
}

.score-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin: 0 15px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background-color: #3498db;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.score-item span {
  width: 50px;
  text-align: right;
  font-weight: 600;
}

.diagnosis {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  text-align: right;
}

.btn-primary {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.report-content {
  white-space: pre-wrap;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  font-family: monospace;
  line-height: 1.5;
  max-height: 300px;
  overflow-y: auto;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    flex: 1;
  }
  
  .history-table {
    display: block;
    overflow-x: auto;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .score-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .score-item label {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .score-bar {
    width: 100%;
    margin: 5px 0;
  }
}
</style>