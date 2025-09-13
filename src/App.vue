<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>Taller Laravel + Vue</v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn 
        variant="text" 
        :to="'/usuarios'"
        prepend-icon="mdi-account-group"
      >
        Usuarios
      </v-btn>
      
      <v-btn 
        variant="text" 
        :to="'/usuarios/nuevo'"
        prepend-icon="mdi-account-plus"
      >
        Nuevo Usuario
      </v-btn>
    </v-app-bar>
    
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>