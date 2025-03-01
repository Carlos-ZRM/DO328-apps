const Axios = require("axios");
const { Tags, FORMAT_HTTP_HEADERS } = require("opentracing");


module.exports = class RestClient {

    constructor(baseURL, tracer) {
        this.baseURL = baseURL;
        this.axios = Axios.create({ baseURL });
        this.tracer = tracer;
    }

    async get(url, rootSpan) {
        const spanName = `servicea:${this.constructor.name}.get`;
        const span = this.tracer.startSpan(spanName, { childOf: rootSpan.context() });
        span.setTag(Tags.PEER_HOSTNAME, this.baseURL);
        span.setTag(Tags.HTTP_URL, url);
        span.setTag(Tags.HTTP_METHOD, "GET");
        span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);

        try {
            const response = await this.axios.get(url, this._buildAxiosRequestConfig(span));
            return response.data;
        } catch (error) {
            span.setTag(Tags.ERROR, error);
        } finally {
            span.finish();
        }
    }

    _buildAxiosRequestConfig(span) {
        const headers = {};
        this.tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
        return { headers };
    }

}

