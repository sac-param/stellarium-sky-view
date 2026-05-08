<template>
  <div style="position: absolute; display:flex; align-items: flex-end;">
    <v-btn large class="tmenubt" color="secondary" style="position: absolute; bottom: 1020px;left: 0;">
      <span class="hidden-xs-only">
        <div class="text-subtitle-2">{{ time }}</div>
        <div class="text-caption">{{ date }}</div>
      </span>
    </v-btn>

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

const STORAGE_KEY = 'selectedBirthDateTime'
const LEGACY_STORAGE_KEY = 'manualDateTimeISO'

export default {
  components: { DateTimePicker },

  data () {
    return {
      dialogOpen: false,
      storedDateTimeLocal: null
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
      if (!this.storedDateTimeLocal) return null

      const m = Moment(this.storedDateTimeLocal, 'YYYY-MM-DDTHH:mm:ss')
      return m.isValid() ? m.toISOString() : null
    }
  },

  mounted () {
    this.initStoredDateTime()
  },

  methods: {
    readStoredDateTimeObject () {
      try {
        const params = new URLSearchParams(window.location.search)
        const from5173 = params.get('selectedBirthDateTime')

        if (from5173) {
          const parsed = JSON.parse(decodeURIComponent(from5173))
          if (parsed?.dateTimeLocal) {
            return parsed
          }
        }

        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return null

        const parsed = JSON.parse(raw)
        if (!parsed) return null

        if (parsed.dateTimeLocal) {
          return parsed
        }

        if (parsed.date && parsed.time) {
          return {
            ...parsed,
            dateTimeLocal: `${parsed.date}T${parsed.time}`
          }
        }

        return null
      } catch (err) {
        console.error('[time-button] Failed to parse selectedBirthDateTime:', err)
        return null
      }
    },

    createAndStoreFallbackDateTime () {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const hh = String(now.getHours()).padStart(2, '0')
      const mi = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')

      const fallback = {
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hh}:${mi}:${ss}`,
        dateTimeLocal: `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      console.log('[time-button] No stored date/time found, created fallback:', fallback)

      return fallback
    },

    initStoredDateTime () {
      let stored = this.readStoredDateTimeObject()

      // Optional legacy support if old key exists
      if (!stored) {
        const legacyISO = localStorage.getItem(LEGACY_STORAGE_KEY)
        if (legacyISO) {
          const m = Moment(legacyISO)
          if (m.isValid()) {
            stored = {
              date: m.format('YYYY-MM-DD'),
              time: m.format('HH:mm:ss'),
              dateTimeLocal: m.format('YYYY-MM-DDTHH:mm:ss')
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
            console.log('[time-button] Migrated legacy manualDateTimeISO -> selectedBirthDateTime:', stored)
          }
        }
      }

      if (!stored) {
        stored = this.createAndStoreFallbackDateTime()
      }

      this.storedDateTimeLocal = stored.dateTimeLocal

      const m = Moment(stored.dateTimeLocal, 'YYYY-MM-DDTHH:mm:ss')
      if (m.isValid()) {
        this.$stel.core.observer.utc = m.toDate().getMJD()
      }
    },

    getStoredDateTimeObject () {
      let stored = this.readStoredDateTimeObject()

      if (!stored) {
        this.initStoredDateTime()
        stored = this.readStoredDateTimeObject()
      }

      return stored
    },

    getLocalTime () {
      const stored = this.getStoredDateTimeObject()

      if (!stored || !stored.dateTimeLocal) {
        return Moment()
      }

      const m = Moment(stored.dateTimeLocal, 'YYYY-MM-DDTHH:mm:ss')
      return m.isValid() ? m : Moment()
    },

    openDialog () {
      this.dialogOpen = true
    },

    updateTime (utcISO) {
      console.log('[time-button] updateTime called')

      const m = Moment(utcISO)
      if (!m.isValid()) {
        console.error('[time-button] Invalid utcISO received:', utcISO)
        return
      }

      const updated = {
        date: m.format('YYYY-MM-DD'),
        time: m.format('HH:mm:ss'),
        dateTimeLocal: m.format('YYYY-MM-DDTHH:mm:ss')
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      this.storedDateTimeLocal = updated.dateTimeLocal

      this.$stel.core.observer.utc = m.toDate().getMJD()

      this.closeDialog()
      this.$root.$emit('user-submitted')

      console.log('[time-button] emitted user-submitted')
      console.log('[time-button] saved to localStorage:', updated)
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
