import { BaseServiceClass } from "@/lib/base-service";
import { ServiceConfig } from "@/types";
import { config } from "@/lib/env";

export class StakworkService extends BaseServiceClass {
    public readonly serviceName = "stakwork";

    constructor(config: ServiceConfig) {
        super(config);
    }

    async createProject<T = unknown>(input: {
        title: any;
        description: any;
        budget: any;
        skills: any;
        name: string;
        workflow_id: number;
        workflow_params: { set_var: { attributes: { vars: unknown } } };
    }): Promise<T> {
        const endpoint = `${config.STAKWORK_BASE_URL}/projects`;
        // Compose headers as required by Stakwork
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Token token=${this.config.apiKey}`,
        };

        // Use the correct HTTP method
        const client = this.getClient();
        const requestFn = () => {
            return client.post<T>(endpoint, input, headers, this.serviceName);
        };

        return this.handleRequest(requestFn, `stakworkRequest ${endpoint}`);
    }

    /**
     * @param endpoint - API endpoint (e.g., '/projects')
     * @param method - HTTP method (default: 'POST')
     * @param input - Object with fields: name, workflow_id, workflow_params (with set_var/attributes/vars)
     * @returns API response as JSON
     */
    async createCustomer<T = unknown>(customerName: string): Promise<T> {
        const endpoint = `${config.STAKWORK_BASE_URL}/customers`;
        // Compose headers as required by Stakwork
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Token token=${this.config.apiKey}`,
        };

        // Use the correct HTTP method
        const client = this.getClient();
        const requestFn = () => {
            return client.post<T>(
                endpoint,
                { customer: { name: customerName } },
                headers,
                this.serviceName
            );
        };

        return this.handleRequest(requestFn, `stakworkRequest ${endpoint}`);
    }

    /**
     * @param endpoint - API endpoint (e.g., '/projects')
     * @param method - HTTP method (default: 'POST')
     * @param input - Object with fields: name, workflow_id, workflow_params (with set_var/attributes/vars)
     * @returns API response as JSON
     */
    async createSecret<T = unknown>(name: string, value: string): Promise<T> {
        const endpoint = `${config.STAKWORK_BASE_URL}/secrets`;

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Token token=${this.config.apiKey}`,
        };

        const client = this.getClient();
        const requestFn = () => {
            return client.post<T>(
                endpoint,
                { secret: { name: name, value: value } },
                headers,
                this.serviceName
            );
        };

        return this.handleRequest(requestFn, `stakworkRequest ${endpoint}`);
    }

    /**
     * Generic helper to make requests to the Stakwork API with required headers and payload structure.
     * @param endpoint - API endpoint (e.g., '/projects')
     * @param method - HTTP method (default: 'POST')
     * @param input - Object with fields: name, workflow_id, workflow_params (with set_var/attributes/vars)
     * @returns API response as JSON
     */
    async stakworkRequest<T = unknown>(
        endpoint: string,
        input: {
            name: string;
            workflow_id: number;
            workflow_params: { set_var: { attributes: { vars: unknown } } };
        }
    ): Promise<T> {
        // Compose headers as required by Stakwork
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Token token=${this.config.apiKey}`,
        };

        // Use the correct HTTP method
        const client = this.getClient();
        const requestFn = () => {
            return client.post<T>(endpoint, input, headers, this.serviceName);
        };

        return this.handleRequest(requestFn, `stakworkRequest ${endpoint}`);
    }
}
