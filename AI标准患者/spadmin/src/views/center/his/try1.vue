<template>
  <div class="history-container">
    <div class="header">
      <h1><i class="icon-history"></i> 练习历史记录</h1>
      <p>查看您的问诊练习记录和成绩</p>
    </div>

    <div class="controls">
      <div class="search-box">
        <input type="text" placeholder="搜索案例编号或疾病类型..." v-model="searchQuery">
        <i class="icon-search"></i>
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
      <table class="history-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :class="column.key">
              {{ column.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td class="case-id">{{ record.caseId }}</td>
            <td class="disease-type">{{ record.diseaseType }}</td>
            <td class="time">{{ record.time }}</td>
            <td class="duration">{{ record.duration }}</td>
            <td class="score">
              <span :class="getScoreClass(record.score)">{{ record.score }}</span>
            </td>
            <td class="actions">
              <button class="detail-btn" @click="viewDetails(record)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredRecords.length === 0" class="no-data">
        <i class="icon-no-data"></i>
        <p>暂无历史记录</p>
      </div>
    </div>

    <!-- 详情对话框 -->
    <div v-if="showDetailDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="detail-dialog">
        <div class="dialog-header">
          <h2>案例详情 - {{ selectedRecord.caseId }}</h2>
          <button class="close-btn" @click="closeDialog">&times;</button>
        </div>
        <div class="dialog-content">
          <div class="detail-section">
            <h3>基本信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <label>疾病类型：</label>
                <span>{{ selectedRecord.diseaseType }}</span>
              </div>
              <div class="detail-item">
                <label>练习时间：</label>
                <span>{{ selectedRecord.time }}</span>
              </div>
              <div class="detail-item">
                <label>用时：</label>
                <span>{{ selectedRecord.duration }}</span>
              </div>
              <div class="detail-item">
                <label>得分：</label>
                <span :class="getScoreClass(selectedRecord.score)">{{ selectedRecord.score }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>评分详情</h3>
            <div class="score-details">
              <div class="score-item">
                <label>病史采集完整性：</label>
                <div class="score-bar">
                  <div class="score-fill" :style="{width: selectedRecord.details.historyScore + '%'}"></div>
                </div>
                <span>{{ selectedRecord.details.historyScore }}%</span>
              </div>
              <div class="score-item">
                <label>医学逻辑性评估：</label>
                <div class="score-bar">
                  <div class="score-fill" :style="{width: selectedRecord.details.logicScore + '%'}"></div>
                </div>
                <span>{{ selectedRecord.details.logicScore }}%</span>
              </div>
              <div class="score-item">
                <label>沟通与人文关怀：</label>
                <div class="score-bar">
                  <div class="score-fill" :style="{width: selectedRecord.details.communicationScore + '%'}"></div>
                </div>
                <span>{{ selectedRecord.details.communicationScore }}%</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>诊断说明</h3>
            <p class="diagnosis">{{ selectedRecord.details.diagnosis }}</p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-primary" @click="closeDialog">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryPage',
  data() {
    return {
      searchQuery: '',
      diseaseFilter: '',
      timeFilter: '',
      showDetailDialog: false,
      selectedRecord: null,
      columns: [
        { key: 'caseId', title: '案例编号' },
        { key: 'diseaseType', title: '疾病类型' },
        { key: 'time', title: '时间' },
        { key: 'duration', title: '用时' },
        { key: 'score', title: '得分' },
        { key: 'actions', title: '' }
      ],
      records: [
        {
          id: 1,
          caseId: '000001',
          diseaseType: '脑梗塞',
          time: '2025-8-11 9:00',
          duration: '10min',
          score: 62,
          details: {
            historyScore: 70,
            logicScore: 60,
            communicationScore: 55,
            diagnosis: '患者表现为突发性右侧肢体无力，伴有言语不清。CT显示左侧大脑中动脉供血区低密度影。诊断为急性脑梗塞，建议立即进行溶栓治疗。'
          }
        },
        {
          id: 2,
          caseId: '000002',
          diseaseType: '头痛',
          time: '2025-8-12 10:00',
          duration: '5min',
          score: 70,
          details: {
            historyScore: 75,
            logicScore: 65,
            communicationScore: 70,
            diagnosis: '患者表现为持续性额部搏动性头痛，无恶心呕吐，无神经系统阳性体征。考虑为紧张性头痛，建议休息和非甾体抗炎药治疗。'
          }
        },
        {
          id: 3,
          caseId: '000003',
          diseaseType: '头晕',
          time: '2025-8-13 10:00',
          duration: '15min',
          score: 80,
          details: {
            historyScore: 85,
            logicScore: 75,
            communicationScore: 80,
            diagnosis: '患者表现为体位改变时出现的眩晕，伴有恶心。Dix-Hallpike试验阳性。诊断为良性阵发性位置性眩晕，建议进行Epley手法复位。'
          }
        }
      ]
    }
  },
  computed: {
    diseaseTypes() {
      return [...new Set(this.records.map(record => record.diseaseType))];
    },
    filteredRecords() {
      let filtered = this.records;
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(record => 
          record.caseId.toLowerCase().includes(query) || 
          record.diseaseType.toLowerCase().includes(query)
        );
      }
      
      // 疾病类型过滤
      if (this.diseaseFilter) {
        filtered = filtered.filter(record => record.diseaseType === this.diseaseFilter);
      }
      
      // 时间过滤
      if (this.timeFilter) {
        const now = new Date();
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.time.replace(/-/g, '/'));
          
          switch (this.timeFilter) {
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
    }
  },
  methods: {
    getScoreClass(score) {
      if (score >= 80) return 'score-high';
      if (score >= 60) return 'score-medium';
      return 'score-low';
    },
    viewDetails(record) {
      this.selectedRecord = record;
      this.showDetailDialog = true;
    },
    closeDialog() {
      this.showDetailDialog = false;
    }
  }
}
</script>

<style lang="less" scoped>
.history-container {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  max-width: 1000px;
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

/* 图标样式 */
.icon-history:before {
  content: "📊";
  margin-right: 10px;
}

.icon-search:before {
  content: "🔍";
}

.icon-no-data:before {
  content: "📝";
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