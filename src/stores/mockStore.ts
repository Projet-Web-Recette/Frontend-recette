import { generateMock } from "@/mock";
import { defineStore } from "pinia";

export const useMockStore = defineStore('mockStore', () => {
    const mock = generateMock()

    return {
        resources: mock.resources
    }
})