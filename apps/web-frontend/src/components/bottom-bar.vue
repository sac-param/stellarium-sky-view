<template>
  <div style="position: absolute; display:flex; align-items: flex-end;">

    <!-- <v-btn large class="tmenubt" color="secondary" @click="openDialog"> -->
    <v-btn large class="tmenubt" color="secondary">
      <v-icon class="hidden-sm-and-up">mdi-clock-outline</v-icon>
      <span class="hidden-xs-only">
        <div class="text-subtitle-2">{{ time }}</div>
        <div class="text-caption">{{ date }}</div>
      </span>
    </v-btn>

    <!-- Full‑screen dialog (80% width/height) -->
    <v-dialog v-model="dialogOpen" persistent :fullscreen="false" content-class="custom-dialog"
      transition="dialog-bottom-transition">
      <date-time-picker :value="pickerValue" :location="$store.state.currentLocation" @input="updateTime"
        @close="closeDialog" />
    </v-dialog>
  </div>
</template>

<script>
import DateTimePicker from '@/components/date-time-picker.vue'
import Moment from 'moment'

export default {
  components: { DateTimePicker },
  data () {
    return {
      dialogOpen: true // open automatically on load
    }
  },
  computed: {
    time () {
      return this.getLocalTime().format('HH:mm:ss')
    },
    date () {
      return this.getLocalTime().format('YYYY-MM-DD')
    },
    pickerValue () {
      const d = new Date()
      d.setMJD(this.$store.state.stel.observer.utc)
      return d.toISOString()
    }
  },
  methods: {
    getLocalTime () {
      var d = new Date()
      d.setMJD(this.$store.state.stel.observer.utc)
      const m = Moment(d)
      m.local()
      return m
    },
    openDialog () {
      this.dialogOpen = true
    },
    updateTime (utcISO) {
      console.log('[time-button] updateTime called') // <-- ADD THIS
      const m = Moment(utcISO)
      this.$stel.core.observer.utc = m.toDate().getMJD()
      this.closeDialog()
      this.$root.$emit('user-submitted')
      console.log('[time-button] emitted user-submitted') // <-- ADD THIS
    },
    closeDialog () {
      this.dialogOpen = false
    }
  }
}
</script>

<style scoped>
@media all and (max-width: 600px) {
  .tmenubt {
    min-width: 30px;
  }
}

/* Custom dialog styling */
.custom-dialog {
  width: 80%;
  height: 80%;
  max-width: 80%;
  max-height: 80%;
  background: transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: glowPulse 2s infinite;
}

@keyframes glowPulse {
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.2);
  }

  50% {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
  }

  100% {
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.2);
  }
}
</style>
