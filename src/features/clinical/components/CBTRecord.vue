<!-- frontend/src/components/ui/CBTRecord.vue -->
<template>
  <div class="cbt-record">
    <div class="cbt-record__column cbt-record__column--thought">
      <h5 class="cbt-record__heading">
        الموقف / الفكرة التلقائية
      </h5>
      <div class="cbt-record__content">
        <slot name="thought" />
      </div>
    </div>
    <div class="cbt-record__column cbt-record__column--distortion">
      <h5 class="cbt-record__heading">
        التشوه المعرفي
      </h5>
      <div class="cbt-record__content">
        <slot name="distortion" />
      </div>
    </div>
    <div class="cbt-record__column cbt-record__column--response">
      <h5 class="cbt-record__heading">
        الرد البديل
      </h5>
      <div class="cbt-record__content">
        <slot name="response" />
      </div>
    </div>
  </div>
</template>