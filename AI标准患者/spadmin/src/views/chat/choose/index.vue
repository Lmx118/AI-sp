<template>
  <div class="case-selection-container">
    <div class="header">
      <h1><i class="fas fa-folder-open"></i> 医学案例选择系统</h1>
      <p>选择您要练习的医学案例，提升临床诊断能力</p>
    </div>

    <div v-if="apiStatus" :class="['api-status', apiStatus.type]">
      <i :class="apiStatus.icon"></i> {{ apiStatus.message }}
    </div>

    <div class="controls">
      <div class="search-box">
        <input type="text" placeholder="搜索患者姓名、症状或疾病类型..." v-model="searchQuery">
        <i class="fas fa-search"></i>
      </div>
      <div class="filter-group">
        <select v-model="diseaseFilter">
          <option value="">所有疾病类型</option>
          <option v-for="disease in diseaseTypes" :key="disease" :value="disease">{{ disease }}</option>
        </select>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <h3>案例总数</h3>
        <div class="value">{{ cases.length }}</div>
      </div>
      <div class="stat-card">
        <h3>疾病类型</h3>
        <div class="value">{{ diseaseTypes.length }}</div>
      </div>
      <div class="stat-card">
        <h3>筛选结果</h3>
        <div class="value">{{ filteredCases.length }}</div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>正在加载案例数据...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>加载失败: {{ error }}</p>
      <button class="retry-btn" @click="fetchPresets">重试</button>
    </div>

    <div v-else>
      <div class="cases-grid">
        <div v-for="(caseItem, index) in filteredCases" :key="index" class="case-card">
          <div class="case-header">
            <h3>{{ caseItem.name }}</h3>
            <span class="case-id">{{ caseItem.id }}</span>
          </div>

          <div class="symptoms">
            <p>{{ caseItem.symptomsText }}</p>
          </div>

          <div class="case-footer">
            <div class="case-meta">
              <span class="disease-type">{{ caseItem.disease }}</span>
              <span class="estimated-time">预计时间: {{ caseItem.estimatedTime }}</span>
            </div>
            <button class="start-btn" @click="startCase(caseItem)">
              <i class="fas fa-play"></i> 开始练习
            </button>
          </div>
        </div>
      </div>

      <div v-if="filteredCases.length === 0" class="no-cases">
        <i class="fas fa-folder-open"></i>
        <p>没有找到匹配的案例</p>
        <button class="btn-primary" @click="resetFilters">重置筛选条件</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'CaseSelectionSystem',
  setup() {
    // API基础URL - 根据实际情况调整
    const apiBaseUrl = 'http://localhost:5000/api'; // 替换为实际API地址

    // 数据状态
    const searchQuery = ref('');
    const diseaseFilter = ref('');
    const cases = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const apiStatus = ref(null);

    // // 模拟API响应数据
    // const mockApiResponse = {
    //   success: true,
    //   data: [
    //     {
    //       id: 1,
    //       caseId: 'C0001',
    //       patientName: '张某',
    //       symptoms: '突发性右侧偏瘫（无力）、右侧感觉障碍，伴有言语不清和面部歪斜。症状持续2小时，无头痛、恶心呕吐。',
    //       diseaseType: '脑梗塞',
    //       estimatedTime: '15-20分钟'
    //     },
    //     {
    //       id: 2,
    //       caseId: 'C0002',
    //       patientName: '李某',
    //       symptoms: '反复头痛3个月，双侧颞部搏动性疼痛，持续4-72小时，活动后加重，伴有畏光、畏声。',
    //       diseaseType: '偏头痛',
    //       estimatedTime: '10-15分钟'
    //     },
    //     {
    //       id: 3,
    //       caseId: 'C0003',
    //       patientName: '王某',
    //       symptoms: '突发眩晕伴恶心呕吐，改变头位时症状加重，无耳鸣、听力下降，无肢体无力。',
    //       diseaseType: '良性位置性眩晕',
    //       estimatedTime: '8-12分钟'
    //     },
    //     {
    //       id: 4,
    //       caseId: 'C0004',
    //       patientName: '赵某',
    //       symptoms: '胸痛2小时，压榨性疼痛，向左肩背部放射，伴大汗、呼吸困难，含服硝酸甘油缓解不明显。',
    //       diseaseType: '急性心肌梗死',
    //       estimatedTime: '15-20分钟'
    //     },
    //     {
    //       id: 5,
    //       caseId: 'C0005',
    //       patientName: '刘某',
    //       symptoms: '发热、咳嗽、咳痰3天，黄脓痰，伴胸痛，无咯血，无呼吸困难。',
    //       diseaseType: '社区获得性肺炎',
    //       estimatedTime: '10-15分钟'
    //     },
    //     {
    //       id: 6,
    //       caseId: 'C0006',
    //       patientName: '孙某',
    //       symptoms: '上腹痛1周，饥饿时加重，进食后缓解，伴反酸、烧心，无黑便、呕血。',
    //       diseaseType: '消化性溃疡',
    //       estimatedTime: '10-15分钟'
    //     }
    //   ]
    // };



    // 获取预设病例
    const fetchPresets = async () => {
      try {
        loading.value = true;
        error.value = null;

        // 实际API调用
        const response = await axios.get(`${apiBaseUrl}/sp/presets`);

        if (response.data.success) {
          // 将返回的data赋值给cases
          cases.value = response.data.data.map(item => ({
            ...item,
            // 将症状数组转换为字符串
            symptomsText: item.symptoms.join(', '),
            // 生成估计时间：根据症状数量，每个症状大约3-5分钟，最小5分钟，最大20分钟
            estimatedTime: Math.min(20, Math.max(5, item.symptoms.length * 3)) + '分钟'
          }));

          apiStatus.value = {
            type: 'success',
            icon: 'fas fa-check-circle',
            message: `成功获取到 ${cases.value.length} 个预设病例`
          };

          setTimeout(() => {
            apiStatus.value = null;
          }, 3000);
        } else {
          error.value = 'API返回失败状态';
          apiStatus.value = {
            type: 'error',
            icon: 'fas fa-exclamation-circle',
            message: '获取预设病例失败'
          };
        }
      } catch (err) {
        error.value = err.message;
        apiStatus.value = {
          type: 'error',
          icon: 'fas fa-exclamation-circle',
          message: '获取预设病例出错: ' + err.message
        };
      } finally {
        loading.value = false;
      }
    };

    // 计算属性
    const diseaseTypes = computed(() => {
      return [...new Set(cases.value.map(caseItem => caseItem.disease))];
    });

    const filteredCases = computed(() => {
      let filtered = cases.value;

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(caseItem =>
          caseItem.name.toLowerCase().includes(query) ||
          caseItem.symptomsText.toLowerCase().includes(query) ||
          caseItem.disease.toLowerCase().includes(query)
        );
      }

      if (diseaseFilter.value) {
        filtered = filtered.filter(caseItem => caseItem.disease === diseaseFilter.value);
      }

      return filtered;
    });

    // 方法
    const startCase = (caseItem) => {
      alert(`开始练习案例: ${caseItem.patientName} - ${caseItem.diseaseType}\n症状: ${caseItem.symptoms}`);
    };

    const resetFilters = () => {
      searchQuery.value = '';
      diseaseFilter.value = '';
    };

    // 生命周期钩子
    onMounted(() => {
      fetchPresets();
    });

    return {
      searchQuery,
      diseaseFilter,
      cases,
      loading,
      error,
      apiStatus,
      diseaseTypes,
      filteredCases,
      fetchPresets,
      startCase,
      resetFilters
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.case-selection-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.header p {
  font-size: 18px;
  opacity: 0.9;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box input {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
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
  align-items: center;
}

.filter-group select {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  min-width: 180px;
}

.stats {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  flex: 1;
  text-align: center;
}

.stat-card h3 {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stat-card .value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.case-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-top: 4px solid #3498db;
  position: relative;
  overflow: hidden;
}

.case-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.case-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #2c3e50);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.case-card:hover::after {
  transform: scaleX(1);
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
  font-weight: 600;
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

.estimated-time {
  font-size: 12px;
  color: #7f8c8d;
}

.start-btn {
  padding: 10px 18px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.start-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.loading-state,
.error-state,
.no-cases {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.loading-state i,
.error-state i,
.no-cases i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
  color: #3498db;
}

.loading-state p,
.error-state p,
.no-cases p {
  margin-bottom: 20px;
  font-size: 18px;
}

.retry-btn,
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

.retry-btn:hover,
.btn-primary:hover {
  background-color: #2980b9;
}

.api-status {
  text-align: center;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-size: 14px;
}

.api-status.success {
  background-color: #e8f5e9;
  color: #27ae60;
}

.api-status.error {
  background-color: #ffebee;
  color: #e74c3c;
}

.api-status i {
  margin-right: 8px;
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
    min-width: 100%;
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

  .stats {
    flex-direction: column;
  }
}

.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}
</style>