<template>
  <div class="controlled-card">
    <div class="controlled-card__header">
      <h4 class="controlled-card__title">
        <Icon
          icon="lock"
          class="controlled-card__icon"
        /> {{ medication }}
      </h4>
      <span class="tag tag--danger">مادة خاضعة للرقابة</span>
    </div>
    <div class="controlled-card__body">
      <p
        v-if="quantity"
        class="controlled-card__detail"
      >
        <strong>الجرعة:</strong> {{ dosage }}
      </p>
      <p class="controlled-card__detail">
        <strong>الكمية المصرحة:</strong> <span class="numeric">{{ quantity }}</span>
      </p>
      <p class="controlled-card__detail">
        <strong>التعليمات:</strong> {{ instructions }}
      </p>
    </div>
    <div class="controlled-card__stamp">
      <Icon
        icon="exclamation-triangle"
        class="mr-1"
      />
      تحقّق من المتطلبات التنظيمية المعتمدة قبل الصرف
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
defineProps({ medication: String, dosage: String, quantity: [Number,String], instructions: String })
</script>
