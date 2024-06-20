import { createStore } from 'vuex';
import { supabase } from './supabase';

export const store = createStore({
  state: {
    authChecked: false,
    userRole: null,
    isAuthenticated: false,
  },
  mutations: {
    setAuthChecked(state, value) {
      state.authChecked = value;
    },
    setUserRole(state, role) {
      state.userRole = role;
    },
    setIsAuthenticated(state, value) {
      state.isAuthenticated = value;
    },
  },
  actions: {
    async checkAuth({ commit }) {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        const user = data.session.user;
        const email = user.user_metadata.email || user.email;
        const { data: roleData, error: roleError } = await supabase.functions.invoke('core', {
          body: {
            type: 'checkRole',
            email: email,
          },
        });
        if (!roleError) {
          commit('setUserRole', roleData.data[0].Role);
          commit('setIsAuthenticated', true);
        }
      }
      commit('setAuthChecked', true);
    },
  },
});
