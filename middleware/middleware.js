const LoggingMiddleWare = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const method = req.method;
        const url = req.originalUrl;
        const status = res.statusCode;
        const statusMessage = res.statusMessage || '';
        const duration = Date.now() - start;

        let color = '\x1b[37m'; // Default white

        if (status >= 500) color = '\x1b[31m'; // Red
        else if (status >= 400) color = '\x1b[33m'; // Yellow
        else if (status >= 300) color = '\x1b[36m'; // Cyan
        else if (status >= 200) color = '\x1b[32m'; // Green

        const logBase = `${method} ${url} ${color}${status}\x1b[0m - ${duration}ms`;

        const isSafe = [200, 201, 204, 304].includes(status);

        // Always log basic info
        console.log(logBase);

        // Only log request data if status is not "safe"
        if (!isSafe) {
            console.log('\x1b[35mRequest Data:\x1b[0m', {
                headers: req.headers,
                query: req.query,
                params: req.params,
                body: req.body
            });

            if (statusMessage) {
                console.log('\x1b[31mStatus Message:\x1b[0m', statusMessage);
            }
        }
    });

    next();
};

const CheckAuthorizationHeader = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization token not found' });
    }

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({"message": "Invalid or expired token",
                        "code": "UNAUTHORIZED"
                });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Bearer token is empty' });
    }

    // Optionally attach token to request object for later use
    req.token = token;

    next();
};



module.exports = {
    LoggingMiddleWare,
    CheckAuthorizationHeader
}