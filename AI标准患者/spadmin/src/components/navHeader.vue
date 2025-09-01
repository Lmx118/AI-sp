<template>
    <div class="header-container">
        <div class="header-left flex-box">
            <el-icon class="icon" size="20" @click="store.commit('collapseMenu')">
                <Fold />
            </el-icon>
            <ul class="flex-box">
                <li v-for="(item,index) in selectMenu" 
                :key="item.path" 
                :class="{selected: route.path ===item.path}"
                class="tab flex-box">
                <el-icon  size="15" >
                <component :is="item.icon" />
                </el-icon>
                <router-link class="text flex-box" :to="{path: item.path}" >
                   {{item.name}} 
                </router-link>
                
                <el-icon class="close" size="15" @click="closeTab(item,index)" ><Close /></el-icon>
                </li>
            </ul>
        </div>
        <div class="header-right">
            <el-dropdown>
                <div class="el-dropdown-link flex-box">
                    <el-avatar :icon="UserFilled" />
                    <p class="user-name">admin</p>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>退出</el-dropdown-item>
                        
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>


<script setup>
import { Close, UserFilled } from '@element-plus/icons-vue'
import {useStore} from 'vuex'
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'

//获取store实例
const store = useStore()
//当前路由对象
const route = useRoute()
const router =useRouter()
const selectMenu=computed(() => store.state.menu.selectMenu)
//点击关闭tag
const closeTab = (item,index) => {
    store.commit('closeMenu',item)
    //删除非当前页tag
    if (route.path !== item.path){
        return
    }
    const selectMenuData=selectMenu.value
    //删除的是最后一项
    if (index === selectMenuData.length){
        //只有一个tag跳转到根目录
        if(!selectMenuData.length){
            router.push('/')
        }else{
            router.push({
                path: selectMenuData[index - 1].path
            })
        }
    }else{//如果删除中间位置tag
        router.push({
            path: selectMenuData[index].path
        })
    }

}

</script>

<style lang="less" scoped>
.flex-box{
    display: flex;
    align-items: center;
    height: 100%;
}
.header-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    background-color: #fff;
    padding-right: 25px;
    .header-left{
        height: 100%; 
        .icon{
            width: 45px;
            height: 100%;
        }
        .icon:hover{
            background-color: #f5f5f5;
            cursor: pointer;
        }
        .tab {
            padding: 0 10px;
            height: 100%;
            text{
                margin: 0 5px;
            }
            .close{
                visibility: hidden;
            }
            &.selected{
                a{
                    color: #409eff
                }
                i{
                    color: #409eff
                }
                background-color: #f5f5f5;
            }
        }
        .tab:hover{
            background-color: #f5f5f5;
            .close{
                visibility: inherit;
                cursor: pointer;
                color: #000;
            }
        }

    }
    .header-right{
        .user-name{
            margin-left: 10px;
        }
    }
    a{
        height: 100%;
        color: #333;
        font-size: 15px;
    }
}
</style>