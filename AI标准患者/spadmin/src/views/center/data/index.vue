<template>
  <div class="statistics-container">
    <div class="header">
      <h1><i class="icon-stats"></i> 数据统计</h1>
      <p>分析您的学习进度和成绩趋势</p>
    </div>

    <div class="controls">
      <div class="date-filter">
        <label>时间范围：</label>
        <select v-model="timeRange" @change="fetchData">
          <option value="7">最近7天</option>
          <option value="30" selected>最近30天</option>
          <option value="90">最近3个月</option>
          <option value="all">全部时间</option>
        </select>
      </div>
      <div class="view-toggle">
        <button 
          :class="{ active: viewMode === 'overview' }" 
          @click="viewMode = 'overview'"
        >
          总览
        </button>
        <button 
          :class="{ active: viewMode === 'detailed' }" 
          @click="viewMode = 'detailed'"
        >
          详细分析
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>正在加载统计数据...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>加载失败: {{ error }}</p>
      <button class="retry-btn" @click="fetchData">重试</button>
    </div>

    <div v-else>
      <div class="stats-overview" v-if="viewMode === 'overview'">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon total-cases">
              <i class="icon-case"></i>
            </div>
            <div class="stat-info">
              <h3>{{ overviewData.totalCases }}</h3>
              <p>总练习案例</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon avg-score">
              <i class="icon-score"></i>
            </div>
            <div class="stat-info">
              <h3>{{ overviewData.avgScore }}<span>分</span></h3>
              <p>平均得分</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon total-time">
              <i class="icon-time"></i>
            </div>
            <div class="stat-info">
              <h3>{{ overviewData.totalTime }}</h3>
              <p>总练习时间</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon completion">
              <i class="icon-completion"></i>
            </div>
            <div class="stat-info">
              <h3>{{ overviewData.completionRate }}<span>%</span></h3>
              <p>案例完成率</p>
            </div>
          </div>
        </div>

        <div class="charts-container">
          <div class="chart-card">
            <h3>成绩趋势</h3>
            <div class="chart">
              <div class="bar-chart">
                <div 
                  v-for="(score, index) in scoreTrendData" 
                  :key="index" 
                  class="bar"
                  :style="{ height: calculateBarHeight(score) + '%' }"
                >
                  <span class="bar-value">{{ score }}</span>
                  <span class="bar-label">{{ scoreDates[index] }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="chart-card">
            <h3>疾病类型分布</h3>
            <div class="chart">
              <div class="pie-chart">
                <div class="pie" :style="pieChartStyle"></div>
                <div class="pie-legend">
                  <div 
                    v-for="(item, index) in diseaseDistribution" 
                    :key="index" 
                    class="legend-item"
                  >
                    <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                    <span>{{ item.name }} ({{ item.value }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <h3>技能掌握进度</h3>
          <div class="progress-bars">
            <div 
              v-for="(skill, index) in skillsProgress" 
              :key="index" 
              class="progress-item"
            >
              <div class="skill-info">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-percent">{{ skill.percentage }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :class="skill.level"
                  :style="{ width: skill.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detailed-analysis" v-else>
        <div class="analysis-tabs">
          <button 
            v-for="tab in analysisTabs" 
            :key="tab.id" 
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'score'">
            <h3>得分详细分析</h3>
            <div class="score-details">
              <div class="score-breakdown">
                <div 
                  v-for="(item, index) in scoreBreakdown" 
                  :key="index" 
                  class="breakdown-item"
                >
                  <div class="breakdown-header">
                    <span class="category">{{ item.category }}</span>
                    <span class="score">{{ item.score }}/100</span>
                  </div>
                  <div class="breakdown-bar">
                    <div 
                      class="breakdown-fill" 
                      :style="{ width: item.score + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="score-comparison">
                <h4>与平均分对比</h4>
                <div class="comparison-chart">
                  <div class="comparison-bars">
                    <div 
                      v-for="(item, index) in scoreComparison" 
                      :key="index" 
                      class="comparison-item"
                    >
                      <div class="comparison-label">{{ item.category }}</div>
                      <div class="comparison-bar">
                        <div 
                          class="user-score" 
                          :style="{ width: item.userScore + '%' }"
                        >
                          <span class="score-value">{{ item.userScore }}</span>
                        </div>
                        <div 
                          class="avg-score" 
                          :style="{ width: item.avgScore + '%' }"
                        >
                          <span class="score-value">{{ item.avgScore }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="comparison-legend">
                    <div class="legend-item">
                      <div class="color-box user"></div>
                      <span>您的得分</span>
                    </div>
                    <div class="legend-item">
                      <div class="color-box avg"></div>
                      <span>平均得分</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'time'">
            <h3>时间使用分析</h3>
            <div class="time-analysis">
              <div class="time-chart">
                <div class="time-bars">
                  <div 
                    v-for="(item, index) in timeAnalysis" 
                    :key="index" 
                    class="time-bar"
                    :style="{ height: calculateTimeBarHeight(item.value) + '%' }"
                  >
                    <span class="time-value">{{ item.value }}分钟</span>
                    <span class="time-label">{{ item.disease }}</span>
                  </div>
                </div>
              </div>
              <div class="time-stats">
                <div class="time-stat">
                  <h4>平均案例用时</h4>
                  <p class="stat-value">{{ timeStats.avgCaseTime }}</p>
                </div>
                <div class="time-stat">
                  <h4>最短案例用时</h4>
                  <p class="stat-value">{{ timeStats.minCaseTime }}</p>
                </div>
                <div class="time-stat">
                  <h4>最长案例用时</h4>
                  <p class="stat-value">{{ timeStats.maxCaseTime }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'improvement'">
            <h3>进步轨迹</h3>
            <div class="improvement-analysis">
              <div class="improvement-chart">
                <div class="improvement-line">
                  <div 
                    v-for="(score, index) in improvementData" 
                    :key="index" 
                    class="improvement-point"
                    :style="{ left: (index * 25) + '%', bottom: calculateImprovementPoint(score) + '%' }"
                  >
                    <span class="point-value">{{ score }}</span>
                  </div>
                </div>
              </div>
              <div class="improvement-stats">
                <div class="improvement-stat">
                  <h4>初始平均分</h4>
                  <p class="stat-value">{{ improvementStats.initialScore }}分</p>
                </div>
                <div class="improvement-stat">
                  <h4>当前平均分</h4>
                  <p class="stat-value">{{ improvementStats.currentScore }}分</p>
                </div>
                <div class="improvement-stat">
                  <h4>进步幅度</h4>
                  <p class="stat-value">{{ improvementStats.improvement }}分</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';

export default {
  name: 'StatisticsPage',
  setup() {
    const apiBaseUrl = 'https://api.bwzhang.cn/api';
    const viewMode = ref('overview');
    const timeRange = ref('30');
    const activeTab = ref('score');
    const loading = ref(false);
    const error = ref(null);
    
    // 会话数据
    const sessions = ref([]);
    const sessionDetails = ref({});
    const scoreReports = ref({});
    
    // 统计数据
    const overviewData = reactive({
      totalCases: 0,
      avgScore: 0,
      totalTime: '0小时0分钟',
      completionRate: 0
    });
    
    const skillsProgress = ref([
      { name: '病史采集', percentage: 0, level: 'low' },
      { name: '体格检查', percentage: 0, level: 'low' },
      { name: '辅助检查', percentage: 0, level: 'low' },
      { name: '诊断推理', percentage: 0, level: 'low' },
      { name: '沟通技巧', percentage: 0, level: 'low' }
    ]);
    
    const scoreBreakdown = ref([
      { category: '病史采集完整性', score: 0 },
      { category: '医学逻辑性评估', score: 0 },
      { category: '沟通与人文关怀', score: 0 },
      { category: '诊断准确性', score: 0 },
      { category: '处理方案合理性', score: 0 }
    ]);
    
    const timeStats = reactive({
      avgCaseTime: '0分0秒',
      minCaseTime: '0分0秒',
      maxCaseTime: '0分0秒'
    });
    
    const improvementStats = reactive({
      initialScore: 0,
      currentScore: 0,
      improvement: 0
    });
    
    const analysisTabs = ref([
      { id: 'score', name: '得分分析' },
      { id: 'time', name: '时间分析' },
      { id: 'improvement', name: '进步轨迹' }
    ]);
    
    const scoreTrendData = ref([]);
    const scoreDates = ref([]);
    
    const diseaseDistribution = ref([]);
    
    const scoreComparison = ref([
      { category: '病史采集', userScore: 0, avgScore: 75 },
      { category: '医学逻辑', userScore: 0, avgScore: 70 },
      { category: '沟通技巧', userScore: 0, avgScore: 80 },
      { category: '诊断准确', userScore: 0, avgScore: 65 },
      { category: '处理方案', userScore: 0, avgScore: 62 }
    ]);
    
    const timeAnalysis = ref([]);
    
    const improvementData = ref([]);
    
    // 计算饼图样式
    const pieChartStyle = computed(() => {
      if (diseaseDistribution.value.length === 0) return {};
      
      let gradientString = '';
      let accumulatedPercent = 0;
      
      diseaseDistribution.value.forEach((item, index) => {
        const startPercent = accumulatedPercent;
        const endPercent = accumulatedPercent + (item.value / overviewData.totalCases) * 100;
        accumulatedPercent = endPercent;
        
        gradientString += `${item.color} ${startPercent}% ${endPercent}%`;
        if (index < diseaseDistribution.value.length - 1) {
          gradientString += ', ';
        }
      });
      
      return {
        background: `conic-gradient(${gradientString})`
      };
    });
    
    // 模拟API响应数据
    const mockSessionsResponse = {
      success: true,
      data: {
        sessions: [
          { sessionId: 'S001', diseaseType: '脑梗塞', time: '2023-08-10', duration: '15分钟', score: 65 },
          { sessionId: 'S002', diseaseType: '头痛', time: '2023-08-11', duration: '10分钟', score: 70 },
          { sessionId: 'S003', diseaseType: '头晕', time: '2023-08-12', duration: '12分钟', score: 68 },
          { sessionId: 'S004', diseaseType: '脑梗塞', time: '2023-08-13', duration: '18分钟', score: 76 },
          { sessionId: 'S005', diseaseType: '心肌梗死', time: '2023-08-14', duration: '20分钟', score: 80 },
          { sessionId: 'S006', diseaseType: '肺炎', time: '2023-08-15', duration: '14分钟', score: 78 },
          { sessionId: 'S007', diseaseType: '脑梗塞', time: '2023-08-16', duration: '16分钟', score: 82 },
          { sessionId: 'S008', diseaseType: '头痛', time: '2023-08-17', duration: '11分钟', score: 75 },
          { sessionId: 'S009', diseaseType: '头晕', time: '2023-08-18', duration: '13分钟', score: 79 },
          { sessionId: 'S010', diseaseType: '心肌梗死', time: '2023-08-19', duration: '19分钟', score: 85 }
        ]
      }
    };
    
    const mockSessionInfoResponse = {
      success: true,
      data: {
        sessionId: 'S001',
        diseaseType: '脑梗塞',
        startTime: '2023-08-10 10:30:00',
        endTime: '2023-08-10 10:45:00',
        score: 65,
        details: {
          historyTaking: 70,
          physicalExam: 60,
          auxiliaryExam: 65,
          diagnosis: 70,
          communication: 75
        }
      }
    };
    
    const mockScoringReportResponse = {
      success: true,
      data: {
        asked_questions: 12,
        asked_weight: 8,
        category_stats: {
          general: {
            asked_questions: 12,
            asked_weight: 8,
            completion_rate: 67,
            total_questions: 18,
            total_weight: 12
          }
        },
        evaluation: {
          comment: '表现良好，诊断准确',
          level: '良好'
        },
        percentage: 67,
        total_questions: 18,
        total_score: 65,
        total_weight: 12
      }
    };
    
    // 获取所有会话
    const fetchSessions = async () => {
      try {
        // 实际API调用代码
        // const response = await axios.get(`${apiBaseUrl}/sp/sessions`);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟API响应
        const response = mockSessionsResponse;
        
        if (response.success) {
          sessions.value = response.data.sessions;
          return true;
        } else {
          error.value = '获取会话列表失败';
          return false;
        }
      } catch (err) {
        error.value = '获取会话列表出错: ' + err.message;
        return false;
      }
    };
    
    // 获取会话信息
    const fetchSessionInfo = async (sessionId) => {
      try {
        // 实际API调用代码
        // const response = await axios.get(`${apiBaseUrl}/sp/session/${sessionId}/info`);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟API响应 - 根据sessionId返回不同数据
        const mockData = {...mockSessionInfoResponse};
        mockData.data.sessionId = sessionId;
        mockData.data.score = sessions.value.find(s => s.sessionId === sessionId)?.score || 65;
        
        return mockData;
      } catch (err) {
        console.error('获取会话信息出错:', err);
        return null;
      }
    };
    
    // 获取评分报告
    const fetchScoringReport = async (sessionId) => {
      try {
        // 实际API调用代码
        // const response = await axios.get(`${apiBaseUrl}/scoring/report/${sessionId}`);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 模拟API响应 - 根据sessionId返回不同数据
        const mockData = {...mockScoringReportResponse};
        mockData.data.total_score = sessions.value.find(s => s.sessionId === sessionId)?.score || 65;
        mockData.data.percentage = Math.round((mockData.data.total_score / 100) * 100);
        
        return mockData;
      } catch (err) {
        console.error('获取评分报告出错:', err);
        return null;
      }
    };
    
    // 处理会话数据
    const processSessionData = async () => {
      // 获取所有会话的详细信息和评分报告
      for (const session of sessions.value) {
        const infoResponse = await fetchSessionInfo(session.sessionId);
        if (infoResponse && infoResponse.success) {
          sessionDetails.value[session.sessionId] = infoResponse.data;
        }
        
        const reportResponse = await fetchScoringReport(session.sessionId);
        if (reportResponse && reportResponse.success) {
          scoreReports.value[session.sessionId] = reportResponse.data;
        }
      }
      
      // 计算统计数据
      calculateStatistics();
    };
    
    // 计算统计数据
    const calculateStatistics = () => {
      if (sessions.value.length === 0) return;
      
      // 计算总览数据
      overviewData.totalCases = sessions.value.length;
      
      const totalScore = sessions.value.reduce((sum, session) => sum + session.score, 0);
      overviewData.avgScore = Math.round(totalScore / sessions.value.length);
      
      const totalMinutes = sessions.value.reduce((sum, session) => {
        const minutes = parseInt(session.duration);
        return sum + (isNaN(minutes) ? 0 : minutes);
      }, 0);
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      overviewData.totalTime = `${hours}小时${minutes}分钟`;
      
      // 计算完成率 (假设所有会话都已完成)
      overviewData.completionRate = 100;
      
      // 计算成绩趋势
      scoreTrendData.value = sessions.value.map(session => session.score);
      scoreDates.value = sessions.value.map(session => session.time.split('-').slice(1).join('-'));
      
      // 计算疾病类型分布
      const diseaseCount = {};
      sessions.value.forEach(session => {
        if (diseaseCount[session.diseaseType]) {
          diseaseCount[session.diseaseType]++;
        } else {
          diseaseCount[session.diseaseType] = 1;
        }
      });
      
      const colors = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#34495e'];
      diseaseDistribution.value = Object.keys(diseaseCount).map((disease, index) => ({
        name: disease,
        value: diseaseCount[disease],
        color: colors[index % colors.length]
      }));
      
      // 计算技能掌握进度
      if (Object.keys(sessionDetails.value).length > 0) {
        const skillScores = {
          '病史采集': 0,
          '体格检查': 0,
          '辅助检查': 0,
          '诊断推理': 0,
          '沟通技巧': 0
        };
        
        let count = 0;
        for (const sessionId in sessionDetails.value) {
          const details = sessionDetails.value[sessionId].details;
          if (details) {
            skillScores['病史采集'] += details.historyTaking || 0;
            skillScores['体格检查'] += details.physicalExam || 0;
            skillScores['辅助检查'] += details.auxiliaryExam || 0;
            skillScores['诊断推理'] += details.diagnosis || 0;
            skillScores['沟通技巧'] += details.communication || 0;
            count++;
          }
        }
        
        if (count > 0) {
          skillsProgress.value = skillsProgress.value.map(skill => {
            const percentage = Math.round(skillScores[skill.name] / count);
            let level = 'low';
            if (percentage >= 80) level = 'high';
            else if (percentage >= 60) level = 'medium';
            
            return {
              ...skill,
              percentage,
              level
            };
          });
        }
      }
      
      // 计算得分详细分析
      if (Object.keys(sessionDetails.value).length > 0) {
        const categoryScores = {
          '病史采集完整性': 0,
          '医学逻辑性评估': 0,
          '沟通与人文关怀': 0,
          '诊断准确性': 0,
          '处理方案合理性': 0
        };
        
        let count = 0;
        for (const sessionId in sessionDetails.value) {
          const details = sessionDetails.value[sessionId].details;
          if (details) {
            categoryScores['病史采集完整性'] += details.historyTaking || 0;
            categoryScores['医学逻辑性评估'] += (details.physicalExam + details.auxiliaryExam) / 2 || 0;
            categoryScores['沟通与人文关怀'] += details.communication || 0;
            categoryScores['诊断准确性'] += details.diagnosis || 0;
            categoryScores['处理方案合理性'] += details.diagnosis || 0; // 假设处理方案合理性与诊断准确性相关
            count++;
          }
        }
        
        if (count > 0) {
          scoreBreakdown.value = scoreBreakdown.value.map(item => ({
            ...item,
            score: Math.round(categoryScores[item.category] / count)
          }));
          
          // 更新用户得分对比
          scoreComparison.value = scoreComparison.value.map(item => ({
            ...item,
            userScore: Math.round(categoryScores[item.category] / count)
          }));
        }
      }
      
      // 计算时间分析
      const diseaseTimes = {};
      sessions.value.forEach(session => {
        const minutes = parseInt(session.duration) || 0;
        if (diseaseTimes[session.diseaseType]) {
          diseaseTimes[session.diseaseType] += minutes;
        } else {
          diseaseTimes[session.diseaseType] = minutes;
        }
      });
      
      timeAnalysis.value = Object.keys(diseaseTimes).map(disease => ({
        disease,
        value: diseaseTimes[disease]
      }));
      
      // 计算时间统计
      const durations = sessions.value.map(session => parseInt(session.duration) || 0).filter(d => d > 0);
      if (durations.length > 0) {
        const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        
        timeStats.avgCaseTime = `${avgDuration}分钟`;
        timeStats.minCaseTime = `${minDuration}分钟`;
        timeStats.maxCaseTime = `${maxDuration}分钟`;
      }
      
      // 计算进步轨迹
      if (sessions.value.length >= 4) {
        improvementData.value = [
          sessions.value[0].score,
          sessions.value[Math.floor(sessions.value.length / 3)].score,
          sessions.value[Math.floor(sessions.value.length * 2 / 3)].score,
          sessions.value[sessions.value.length - 1].score
        ];
        
        improvementStats.initialScore = sessions.value[0].score;
        improvementStats.currentScore = sessions.value[sessions.value.length - 1].score;
        improvementStats.improvement = improvementStats.currentScore - improvementStats.initialScore;
      }
    };
    
    // 计算柱状图高度
    const calculateBarHeight = (score) => {
      return (score / 100) * 80 + 10; // 将分数映射到10%-90%的高度范围
    };
    
    // 计算时间柱状图高度
    const calculateTimeBarHeight = (value) => {
      const maxValue = Math.max(...timeAnalysis.value.map(item => item.value));
      return maxValue > 0 ? (value / maxValue) * 80 + 10 : 10;
    };
    
    // 计算进步轨迹点位置
    const calculateImprovementPoint = (score) => {
      const minScore = Math.min(...improvementData.value);
      const maxScore = Math.max(...improvementData.value);
      const range = maxScore - minScore;
      
      return range > 0 ? ((score - minScore) / range) * 80 + 10 : 50;
    };
    
    // 获取数据
    const fetchData = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const sessionsSuccess = await fetchSessions();
        if (sessionsSuccess) {
          await processSessionData();
        }
      } catch (err) {
        error.value = '获取数据出错: ' + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    // 添加进度条动画效果
    onMounted(() => {
      fetchData();
      
      setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
          const width = bar.style.width;
          bar.style.width = '0';
          setTimeout(() => {
            bar.style.width = width;
          }, 100);
        });
      }, 500);
    });
    
    return {
      viewMode,
      timeRange,
      activeTab,
      loading,
      error,
      overviewData,
      skillsProgress,
      scoreBreakdown,
      timeStats,
      improvementStats,
      analysisTabs,
      scoreTrendData,
      scoreDates,
      diseaseDistribution,
      scoreComparison,
      timeAnalysis,
      improvementData,
      pieChartStyle,
      calculateBarHeight,
      calculateTimeBarHeight,
      calculateImprovementPoint,
      fetchData
    };
  }
};
</script>

<style lang="less" scoped>
.statistics-container {
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

.date-filter {
  display: flex;
  align-items: center;
}

.date-filter label {
  margin-right: 10px;
  font-weight: 500;
}

.date-filter select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.view-toggle {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
}

.view-toggle button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.view-toggle button.active {
  background-color: #3498db;
  color: white;
}

/* 总览样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.stat-icon.total-cases {
  background-color: #e8f4fd;
  color: #3498db;
}

.stat-icon.avg-score {
  background-color: #e8f6f3;
  color: #27ae60;
}

.stat-icon.total-time {
  background-color: #fef9e7;
  color: #f39c12;
}

.stat-icon.completion {
  background-color: #f9ebea;
  color: #e74c3c;
}

.stat-info h3 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

.stat-info h3 span {
  font-size: 16px;
  margin-left: 2px;
}

.stat-info p {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-card h3 {
  margin: 0 0 15px;
  color: #2c3e50;
  font-size: 18px;
}

.chart {
  height: 250px;
}

.bar-chart {
  display: flex;
  height: 200px;
  align-items: flex-end;
  gap: 15px;
  padding: 0 10px;
}

.bar {
  flex: 1;
  background: #3498db;
  border-radius: 4px 4px 0 0;
  position: relative;
  min-width: 30px;
  transition: height 0.5s ease;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
}

.bar-value {
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
}

.pie-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.pie {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  transition: all 0.5s ease;
}

.pie-legend {
  margin-left: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  margin-right: 8px;
}

.progress-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.progress-section h3 {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 18px;
}

.progress-item {
  margin-bottom: 15px;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.skill-name {
  font-weight: 500;
}

.skill-percent {
  color: #7f8c8d;
}

.progress-bar {
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.high {
  background-color: #27ae60;
}

.medium {
  background-color: #f39c12;
}

.low {
  background-color: #e74c3c;
}

/* 详细分析样式 */
.detailed-analysis {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.analysis-tabs {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 20px;
}

.analysis-tabs button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #7f8c8d;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.analysis-tabs button.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-content h3 {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 18px;
}

.score-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.breakdown-item {
  margin-bottom: 15px;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.category {
  font-weight: 500;
}

.score {
  color: #7f8c8d;
}

.breakdown-bar {
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.breakdown-fill {
  height: 100%;
  background-color: #3498db;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.score-comparison h4 {
  margin: 0 0 15px;
  color: #2c3e50;
}

.comparison-chart {
  height: 250px;
}

.comparison-bars {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.comparison-item {
  display: flex;
  align-items: center;
}

.comparison-label {
  width: 100px;
  font-size: 14px;
  font-weight: 500;
}

.comparison-bar {
  flex: 1;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin: 0 10px;
}

.user-score {
  position: absolute;
  left: 0;
  height: 100%;
  background-color: #3498db;
  border-radius: 10px 0 0 10px;
  transition: width 0.5s ease;
}

.avg-score {
  // position: absolute;
  // left: 0;
  // height: 100%;
  background-color: #95a5a6;
  // border-radius: 10px 0 0 10px;
  opacity: 0.7;
  transition: width 0.5s ease;
}

.score-value {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.comparison-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.comparison-legend .legend-item {
  display: flex;
  align-items: center;
}

.color-box {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  margin-right: 8px;
}

.color-box.user {
  background-color: #3498db;
}

.color-box.avg {
  background-color: #95a5a6;
}

.time-analysis {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.time-chart {
  height: 300px;
}

.time-bars {
  display: flex;
  height: 250px;
  align-items: flex-end;
  gap: 15px;
  padding: 0 10px;
}

.time-bar {
  flex: 1;
  background: linear-gradient(to top, #3498db, #2c3e50);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-width: 30px;
  transition: height 0.5s ease;
}

.time-value {
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #2c3e50;
}

.time-label {
  position: absolute;
  bottom: -25px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
}

.time-stats {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.time-stat {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.time-stat h4 {
  margin: 0 0 10px;
  color: #7f8c8d;
  font-size: 14px;
}

.stat-value {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.improvement-analysis {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.improvement-chart {
  height: 300px;
  position: relative;
}

.improvement-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.improvement-point {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #3498db;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
}

.point-value {
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.improvement-stats {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.improvement-stat {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.improvement-stat h4 {
  margin: 0 0 10px;
  color: #7f8c8d;
  font-size: 14px;
}

/* 图标样式 */
.icon-stats:before {
  content: "📈";
  margin-right: 10px;
}

.icon-case:before {
  content: "📋";
}

.icon-score:before {
  content: "💯";
}

.icon-time:before {
  content: "⏱";
}

.icon-completion:before {
  content: "✅";
}

/* 加载和错误状态 */
.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.loading-state i, .error-state i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
  color: #3498db;
}

.loading-state p, .error-state p {
  margin-bottom: 20px;
  font-size: 18px;
}

.retry-btn {
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

.retry-btn:hover {
  background-color: #2980b9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-container {
    padding: 15px;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .score-details {
    grid-template-columns: 1fr;
  }
  
  .time-analysis, .improvement-analysis {
    grid-template-columns: 1fr;
  }
  
  .pie-chart {
    flex-direction: column;
    height: auto;
  }
  
  .pie-legend {
    margin-left: 0;
    margin-top: 20px;
  }
  
  .chart {
    height: 200px;
  }
  
  .time-chart, .improvement-chart {
    height: 250px;
  }
}
</style>