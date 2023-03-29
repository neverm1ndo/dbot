export class Beer {
    private _inBeer: Map<string, number> = new Map();

    public add(username: string, percent: number): void {
        this._inBeer.set(username, percent);
    }

    public clear(): void {
        this._inBeer.clear();
    }

    public getMostBeer(): [string, number] | undefined {
        if (this._inBeer.size === 0) return undefined;
        
        let most;
        
        for (let [chatter, percent] of this._inBeer.entries()) {
            if (most === undefined || (most[1] as number > percent)) {
                most = [chatter, percent];
            }
        }
        return most as [string, number];
    }
}