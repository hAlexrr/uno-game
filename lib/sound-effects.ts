export class SoundEffects {
    private static sounds: { [key: string]: HTMLAudioElement } = {}
    private static enabled: boolean = true

    public static init() {
        // Initialize sound effects
        this.sounds = {
            cardPlay: new Audio("/sounds/card-play.mp3"),
            cardDraw: new Audio("/sounds/card-draw.mp3"),
            uno: new Audio("/sounds/uno.mp3"),
            win: new Audio("/sounds/win.mp3"),
            lose: new Audio("/sounds/lose.mp3"),
            shuffle: new Audio("/sounds/shuffle.mp3"),
            error: new Audio("/sounds/error.mp3")
        }

        // Set volume
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.5
        })
    }

    public static play(soundName: string) {
        if (!this.enabled) return

        const sound = this.sounds[soundName]
        if (sound) {
            sound.currentTime = 0
            sound.play().catch(() => {
                // Ignore play() errors (usually due to autoplay restrictions)
            })
        }
    }

    public static setEnabled(enabled: boolean) {
        this.enabled = enabled
    }

    public static isEnabled(): boolean {
        return this.enabled
    }
} 