<template>
  <v-card width="400">
    <v-card-title class="text-h5">User Information</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="name"
        label="Name"
        outlined
        required
      ></v-text-field>

      <v-menu
        ref="dateMenu"
        v-model="dateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="dob"
            label="Date of Birth"
            readonly
            outlined
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="dob"
          @input="dateMenu = false"
        ></v-date-picker>
      </v-menu>

      <v-menu
        ref="timeMenu"
        v-model="timeMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="time"
            label="Time (HH:MM)"
            readonly
            outlined
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-model="time"
          format="24hr"
          @click:minute="timeMenu = false"
        ></v-time-picker>
      </v-menu>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="cancel">{{ $t('Cancel') }}</v-btn>
      <v-btn color="primary" :loading="loading" @click="submit">
        {{ $t('Submit') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  data () {
    return {
      name: '',
      dob: null,
      time: null,
      dateMenu: false,
      timeMenu: false,
      loading: false
    }
  },
  methods: {
    submit () {
      if (!this.name || !this.dob || !this.time) {
        alert('Please fill all fields')
        return
      }
      this.loading = true
      // Simulate loading for 1 second
      setTimeout(() => {
        this.loading = false
        // Emit the collected data
        this.$emit('submit', {
          name: this.name,
          dob: this.dob,
          time: this.time
        })
        // Close the popup
        this.$emit('close')
      }, 1000)
    },
    cancel () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/* Optional: adjust spacing if needed */
</style>
