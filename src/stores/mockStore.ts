import { generateMock } from "@/mock";
import { defineStore } from "pinia";

export const useMockStore = defineStore('mockStore', {
    state: () => ({
        mock: generateMock()
    }),

    getters: {
        resources: (state) => state.mock.resources,
        items: (state) => state.mock.items
    }
})