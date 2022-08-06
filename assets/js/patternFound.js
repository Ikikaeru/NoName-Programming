class PatternFound {
    constructor(result)
    {
        this.name = result.name;
        this.currentName = result.currentName;
        this.begin = result.begin;
        this.end = result.end;
        this.nested = result.nested;
        this.content = result.content;
        this.error = result.error;
        this.line = result.line;
        this.lineChar = result.lineChar;
    }
}