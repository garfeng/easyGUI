export namespace model {
	
	export class ExecResult {
	    cmd?: string;
	    stdout?: string;
	    stderr?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new ExecResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cmd = source["cmd"];
	        this.stdout = source["stdout"];
	        this.stderr = source["stderr"];
	        this.error = source["error"];
	    }
	}
	export class RecentData {
	    recentCfgFiles: string[];
	
	    static createFrom(source: any = {}) {
	        return new RecentData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.recentCfgFiles = source["recentCfgFiles"];
	    }
	}

}

