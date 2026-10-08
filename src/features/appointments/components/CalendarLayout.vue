<template>
  <div class="appointments-calendar-view">
    <Breadcrumb />
    <PageHeader
      title="مفكرة المواعيد"
      subtitle="استعراض وإدارة الحجوزات والجلسات"
    >
      <div class="flex gap-2">
        <select
          :value="view"
          class="form-control form-control--select calendar-view-select"
          aria-label="طريقة عرض التقويم"
          @change="$emit('view-change', $event.target.value)"
        >
          <option value="day">
            عرض اليوم
          </option>
          <option value="week">
            عرض الأسبوع
          </option>
          <option value="month">
            عرض الشهر
          </option>
        </select>
        <BaseButton
          v-if="canManageAppointments"
          variant="primary"
          :to="{ name: 'AppointmentCreate' }"
        >
          <Icon icon="plus" /> حجز موعد
        </BaseButton>
      </div>
    </PageHeader>

    <FilterBar
      v-if="canManageUsers"
      :model-value="filters"
      :fields="doctorFilterFields"
      variant="panel"
      class="mb-4"
      @update:model-value="$emit('update:filters', $event)"
      @apply="$emit('filter-apply')"
      @reset="$emit('filter-reset')"
    />

    <BaseCard class="mb-4">
      <div class="card__body">
        <div class="flex flex--justify-between flex--center flex--wrap gap-2">
          <BaseButton
            variant="secondary"
            size="sm"
            @click="$emit('navigate', 'prev')"
          >
            <Icon icon="chevron-right" />
          </BaseButton>
          <span class="text-base font-semibold text-primary">{{ periodLabel }}</span>
          <BaseButton
            variant="secondary"
            size="sm"
            @click="$emit('navigate', 'today')"
          >
            اليوم
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            @click="$emit('navigate', 'next')"
          >
            <Icon icon="chevron-left" />
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <CalendarLegend />

    <CalendarSkeleton
      v-if="loading && !appointments.length"
      :rows="12"
      :cols="3"
    />

    <template v-else>
      <Transition
        name="calendar-fade"
        mode="out-in"
      >
        <CalendarView
          :view="view"
          :current-date-str="currentDateStr"
          :time-slots="timeSlots"
          :appointments="appointments"
          :loading="loading"
          :weekly-view-data="weeklyViewData"
          :month-appointments="monthAppointments"
          :month-name="monthName"
          :year="year"
          :month-index="monthIndex"
          :can-manage="canManageAppointments"
          @drop-slot="$emit('drop-slot', $event)"
          @drop-week="$emit('drop-week', $event)"
          @day-click="$emit('day-click', $event)"
        />
      </Transition>
    </template>
  </div>
</template>

<script setup>
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import CalendarLegend from '@/features/appointments/components/CalendarLegend.vue'
import CalendarSkeleton from '@/features/appointments/components/CalendarSkeleton.vue'
import CalendarView from '@/features/appointments/components/CalendarView.vue'

defineProps({
  view: { type: String, required: true },
  canManageUsers: { type: Boolean, default: false },
  canManageAppointments: { type: Boolean, default: false },
  filters: { type: Object, required: true },
  doctorFilterFields: { type: Array, required: true },
  periodLabel: { type: String, required: true },
  loading: { type: Boolean, default: false },
  appointments: { type: Array, required: true },
  currentDateStr: { type: String, required: true },
  timeSlots: { type: Array, required: true },
  weeklyViewData: { type: Array, required: true },
  monthAppointments: { type: Array, required: true },
  monthName: { type: String, required: true },
  year: { type: Number, required: true },
  monthIndex: { type: Number, required: true },
})

defineEmits([
  'view-change', 'update:filters', 'filter-apply', 'filter-reset',
  'navigate', 'drop-slot', 'drop-week', 'day-click'
])
</script>
