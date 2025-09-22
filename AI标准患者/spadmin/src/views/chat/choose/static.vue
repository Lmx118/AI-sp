<template>
  <div class="case-selection-container">
    <div class="header">
      <h1><i class="icon-cases"></i> 案例选择</h1>
      <p>选择您要练习的医学案例</p>
    </div>

    <div class="controls">
      <div class="search-box">
        <input type="text" placeholder="搜索患者姓名或症状..." v-model="searchQuery">
        <i class="icon-search"></i>
      </div>
      <div class="filter-group">
        <select v-model="diseaseFilter">
          <option value="">所有疾病类型</option>
          <option v-for="disease in diseaseTypes" :key="disease" :value="disease">{{ disease }}</option>
        </select>
        <!-- <select v-model="difficultyFilter">
          <option value="">所有难度</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select> -->
      </div>
    </div>

    <div class="cases-grid">
      <div 
        v-for="caseItem in filteredCases" 
        :key="caseItem.id" 
        class="case-card"
        :class="caseItem.difficulty"
      >
        <div class="case-header">
          <h3>{{ caseItem.patientName }}</h3>
          <span class="case-id">{{ caseItem.caseId }}</span>
        </div>
        
        <div class="symptoms">
          <p>{{ caseItem.symptoms }}</p>
        </div>
        
        <div class="case-footer">
          <div class="case-meta">
            <span class="disease-type">{{ caseItem.diseaseType }}</span>
            <span class="difficulty" :class="caseItem.difficulty">{{ formatDifficulty(caseItem.difficulty) }}</span>
          </div>
          <button class="start-btn" @click="startCase(caseItem)">
            进入练习
          </button>
        </div>
      </div>
    </div>

    <!-- <div v-if="filteredCases.length === 0" class="no-cases">
      <i class="icon-no-cases"></i>
      <p>没有找到匹配的案例</p>
      <button class="btn-primary" @click="resetFilters">重置筛选条件</button>
    </div> -->
</div>
</template>

<script>

import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import axios from 'axios';
const presets = ref([]);
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

export default {
  name: 'CaseSelectionPage',
  data() {
    return {
      searchQuery: '',
      diseaseFilter: '',
      cases: 
      [
        {
          id: 1,
          caseId: 'C0001',
          patientName: '张某',
          symptoms: '突发性右侧偏瘫（无力）、右侧感觉障碍，伴有言语不清和面部歪斜。症状持续2小时，无头痛、恶心呕吐。',
          diseaseType: '脑梗塞',
          estimatedTime: '15-20分钟'
        },
        {
          id: 2,
          caseId: 'C0002',
          patientName: '李某',
          symptoms: '反复头痛3个月，双侧颞部搏动性疼痛，持续4-72小时，活动后加重，伴有畏光、畏声。',
          diseaseType: '偏头痛',
          estimatedTime: '10-15分钟'
        },
        {
          id: 3,
          caseId: 'C0003',
          patientName: '王某',
          symptoms: '突发眩晕伴恶心呕吐，改变头位时症状加重，无耳鸣、听力下降，无肢体无力。',
          diseaseType: '良性位置性眩晕',
          estimatedTime: '8-12分钟'
        },
        {
          id: 4,
          caseId: 'C0004',
          patientName: '赵某',
          symptoms: '胸痛2小时，压榨性疼痛，向左肩背部放射，伴大汗、呼吸困难，含服硝酸甘油缓解不明显。',
          diseaseType: '急性心肌梗死',
          estimatedTime: '15-20分钟'
        },
        {
          id: 5,
          caseId: 'C0005',
          patientName: '刘某',
          symptoms: '发热、咳嗽、咳痰3天，黄脓痰，伴胸痛，无咯血，无呼吸困难。',
          diseaseType: '社区获得性肺炎',
          estimatedTime: '10-15分钟'
        },
        {
          id: 6,
          caseId: 'C0006',
          patientName: '孙某',
          symptoms: '上腹痛1周，饥饿时加重，进食后缓解，伴反酸、烧心，无黑便、呕血。',
          diseaseType: '消化性溃疡',
          estimatedTime: '10-15分钟'
        }
      ]
    }
  },
  computed: {
    diseaseTypes() {
      return [...new Set(this.cases.map(caseItem => caseItem.diseaseType))];
    },
    filteredCases() {
      let filtered = this.cases;
      
      // 搜索过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(caseItem => 
          caseItem.patientName.toLowerCase().includes(query) || 
          caseItem.symptoms.toLowerCase().includes(query) ||
          caseItem.diseaseType.toLowerCase().includes(query)
        );
      }
      
      // 疾病类型过滤
      if (this.diseaseFilter) {
        filtered = filtered.filter(caseItem => caseItem.diseaseType === this.diseaseFilter);
      }
      
      // 难度过滤
      if (this.difficultyFilter) {
        filtered = filtered.filter(caseItem => caseItem.difficulty === this.difficultyFilter);
      }
      
      return filtered;
    }
  },
  methods: {
    formatDifficulty(difficulty) {
      const difficultyMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      };
      return difficultyMap[difficulty];
    },
    startCase(caseItem) {
      // 实际应用中这里可以跳转到案例练习页面
      this.$emit('start-case', caseItem);
      alert(`开始练习案例: ${caseItem.patientName} - ${caseItem.diseaseType}`);
    },
    resetFilters() {
      this.searchQuery = '';
      this.diseaseFilter = '';
      this.difficultyFilter = '';
    }
  }
}
</script>

<style lang="less" scoped>
.case-selection-container {
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
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box input {
  width: 80%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
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
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.case-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s, box-shadow 0.3s;
  border-top: 4px solid #3498db;
}

.case-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.case-card.easy {
  border-top-color: #27ae60;
}

.case-card.medium {
  border-top-color: #f39c12;
}

.case-card.hard {
  border-top-color: #e74c3c;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.case-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.case-id {
  font-size: 12px;
  color: #7f8c8d;
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.symptoms {
  flex: 1;
  margin-bottom: 20px;
}

.symptoms p {
  margin: 0;
  color: #555;
  line-height: 1.6;
  display: -webkit-box;
  line-clamp: 3;
  box-orient: vertical;
  overflow: hidden;
}

.case-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.disease-type {
  font-size: 14px;
  color: #3498db;
  font-weight: 500;
}

.difficulty {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.difficulty.easy {
  background-color: #e8f5e9;
  color: #27ae60;
}

.difficulty.medium {
  background-color: #fff8e1;
  color: #f39c12;
}

.difficulty.hard {
  background-color: #ffebee;
  color: #e74c3c;
}

.start-btn {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.start-btn:hover {
  background-color: #2980b9;
}

.no-cases {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.no-cases i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

.no-cases p {
  margin-bottom: 20px;
  font-size: 18px;
}

.btn-primary {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

/* 图标样式 */
.icon-cases:before {
  content: "📂";
  margin-right: 10px;
}

.icon-search:before {
  content: "🔍";
}

.icon-no-cases:before {
  content: "📝";
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-selection-container {
    padding: 15px;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group select {
    flex: 1;
  } 
  
  .cases-grid {
    grid-template-columns: 1fr;
  }
  
  .case-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .start-btn {
    align-self: flex-end;
  }
}
</style>