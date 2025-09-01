
<template>
    <!-- <el-sub-menu index="1">
        <template #title>
            <el-icon>
                <location />
            </el-icon>
            <span>说明</span>
        </template>
            <el-menu-item 
            @click="handleClick(props.menuData[0].children.)"
            index="1-1">项目概述</el-menu-item>
            <el-menu-item index="1-2">使用说明</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="2">
        <template #title>
            <el-icon>
                <location />
            </el-icon>
            <span>对话</span>
        </template>
            <el-menu-item index="2-1">自由对话</el-menu-item>
            <el-menu-item index="2-2">案例选择</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="3">
        <template #title>
            <el-icon>
                <location />
            </el-icon>
            <span>个人中心</span>
        </template>
            <el-menu-item index="3-1">历史记录</el-menu-item>
            <el-menu-item index="3-2">数据统计</el-menu-item>
    </el-sub-menu> -->

    <template v-for="(item, index) in props.menuData">
        <el-menu-item @click="handleClick(item, `${props.index}-${item.meta.id}`)"
            v-if="!item.children || item.children.length == 0" :index="`${props.index}-${item.meta.id}`"
            :key="`${props.index}-${item.meta.id}`">
            <el-icon size="20">
                <component :is="item.meta.icon"></component>
            </el-icon>
            <span>{{ item.meta.name }}</span>
        </el-menu-item>
        <el-sub-menu v-else :index="`${props.index}-${item.meta.id}`">
            <template #title>
                <el-icon size="20">
                    <component :is="item.meta.icon"></component>
                </el-icon>
                <span>{{ item.meta.name }}</span>
            </template>
            <tree-menu :index="`${props.index}-${item.meta.id}`" :menuData="item.children" />
        </el-sub-menu>

    </template>

</template>


<script setup>
import {useRouter}from "vue-router"
import {useStore} from "vuex"
const props=defineProps(['menuData','index'])
console.log(props,"props")

//创建router实例
const router=useRouter()
const store=useStore()

//点击菜单
const handleClick=(item,active) =>{
    store.commit('addMenu',item.meta)
    router.push(item.meta.path)
}

</script>



<style scoped></style>
