import type { Updatable } from "@/gameData/types";
import { defineStore } from "pinia";

export const gameStore = defineStore('gameStore', {
    state: () => ({
        miners: [] as any[],
        convoyers: [] as any[],
        updatables: [] as Updatable[]
    })
})