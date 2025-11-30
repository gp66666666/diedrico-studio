// Rate Limiter for API Calls
// Prevents exceeding Gemini API free tier limits (15 RPM)

export class RateLimiter {
    private requests: number[] = [];
    private readonly limit: number;
    private readonly windowMs: number;

    constructor(limit: number = 15, windowMs: number = 60000) {
        this.limit = limit;
        this.windowMs = windowMs;
    }

    async checkLimit(): Promise<void> {
        const now = Date.now();

        // Remove expired requests
        this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);

        // Check if we've hit the limit
        if (this.requests.length >= this.limit) {
            const oldestRequest = this.requests[0];
            const waitTime = this.windowMs - (now - oldestRequest);

            throw new Error(
                `Límite de solicitudes alcanzado. Por favor espera ${Math.ceil(waitTime / 1000)} segundos.`
            );
        }

        // Add current request
        this.requests.push(now);
    }

    getRemainingRequests(): number {
        const now = Date.now();
        this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
        return Math.max(0, this.limit - this.requests.length);
    }

    getResetTime(): number {
        if (this.requests.length === 0) return 0;

        const now = Date.now();
        const oldestRequest = this.requests[0];
        const resetTime = oldestRequest + this.windowMs;

        return Math.max(0, resetTime - now);
    }
}

export const rateLimiter = new RateLimiter();
