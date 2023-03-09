export class Beer {
    private _inBeer: Map<number, string> = new Map();

    public add(username: string, percent: number): void {
        this._inBeer.set(percent, username);
        console.log(this._inBeer.entries());
    }

    public clear(): void {
        this._inBeer.clear();
    }

    public getMostBeer(): [string, number] | undefined {
        for (let i = this._inBeer.size; i > 0; i--) {
            const most = this._inBeer.get(i);
            if (most) return [most, i];
        }
        return undefined;
    }
}