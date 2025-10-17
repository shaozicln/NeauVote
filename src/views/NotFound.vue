<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-5">
    <!-- 404 大标题 -->
    <h1 class="text-[80px] font-bold mb-5 font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif]">404</h1>
    <!-- 页面提示文本 -->
    <p class="text-2xl mb-8">这个页面找不到了</p>
    <!-- 辅助提示 -->
    <div class="mb-10 leading-[1.6]">
      <p>页面加载出错，请联系管理员</p>
      <!-- 若需恢复注释的趣味提示，直接取消注释即可，样式已兼容 -->
      <!-- <p class="mt-2">可能跟温迪一起出游了吧...</p>
      <p class="mt-2">去月球找结城理和渚薰也说不定...</p>
      <p class="mt-2">和joker一起去印象空间了也没准呢...</p>
      <p class="mt-2">可能随着无名客登上列车航行宇宙了大概...</p>
      <p class="mt-2">可能不小心迷路到零号空洞了...</p>
      <p class="mt-2">可能去了很远的地方...</p> -->
    </div>
    <!-- 返回首页链接 -->
    <router-link 
      to="/" 
      class="text-blue-500 text-base border border-blue-500 px-5 py-2.5 rounded transition-all duration-300 hover:bg-blue-500 hover:text-white no-underline"
    >
      返回首页 »
    </router-link>
  </div>
</template>