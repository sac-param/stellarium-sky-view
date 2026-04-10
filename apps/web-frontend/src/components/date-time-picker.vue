<template>
  <v-card class="fill-height">
    <v-row class="fill-height" no-gutters>
      <!-- Left column: Form -->
      <v-col cols="6" class="d-flex flex-column justify-center pa-8">
        <v-card-title class="text-h5 pl-0">User Information</v-card-title>
        <v-text-field v-model="name" label="Name" outlined required></v-text-field>

        <v-text-field v-model="dob" label="Date of Birth" type="date" outlined></v-text-field>

        <div class="d-flex align-center">
          <v-select v-model="hour" :items="hours" label="Hour" outlined dense
            style="width: 100px; margin-right: 8px;"></v-select>
          <v-select v-model="minute" :items="minutes" label="Minute" outlined dense style="width: 100px;"></v-select>
        </div>

        <v-card-actions class="px-0">
          <v-spacer></v-spacer>
          <!-- <v-btn text @click="cancel">{{ $t('Cancel') }}</v-btn> -->
          <v-btn color="primary" :loading="loading" @click="submit">
            {{ $t('Submit') }}
          </v-btn>
        </v-card-actions>
      </v-col>

      <!-- Right column: Empty with background -->
      <v-col cols="6" class="right-column d-flex align-center justify-center">
        <!-- Empty content -->
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import Moment from 'moment'

export default {
  data () {
    return {
      name: '',
      dob: '',
      hour: '12',
      minute: '00',
      loading: false,
      hours: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')),
      minutes: Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
    }
  },
  props: ['value', 'location'],
  methods: {
    submit () {
      if (!this.name || !this.dob) {
        alert('Please fill all fields')
        return
      }
      console.log('[date-time-picker] submit called') // <-- ADD THIS
      this.loading = true
      const localDateTimeStr = `${this.dob} ${this.hour}:${this.minute}:00`
      const localMoment = Moment(localDateTimeStr, 'YYYY-MM-DD HH:mm:ss')
      if (!localMoment.isValid()) {
        alert('Invalid date or time')
        this.loading = false
        return
      }
      const utcMoment = localMoment.utc()
      this.$emit('input', utcMoment.toISOString())
      this.$emit('close')
      this.$root.$emit('user-submitted') // <-- ADD LOG AFTER THIS
      console.log('[date-time-picker] emitted user-submitted') // <-- ADD THIS
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },
    cancel () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.fill-height {
  height: 100%;
}

.right-column {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* You can change the gradient or use a solid color */
}
</style>
