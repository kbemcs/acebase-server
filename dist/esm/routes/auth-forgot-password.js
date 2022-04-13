import { createSignedPublicToken } from '../shared/tokens.js';
import { ID } from 'acebase-core';
import { sendBadRequestError, sendUnexpectedError } from '../shared/error.js';
export class ForgotPasswordError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
export const addRoute = (env) => {
    env.app.post(`/auth/${env.db.name}/forgot_password`, async (req, res) => {
        const details = req.body;
        try {
            if (!env.config.email || typeof env.config.email.send !== 'function') {
                throw new ForgotPasswordError('server_email_config', 'Server email settings have not been configured');
            }
            if (typeof details !== 'object' || typeof details.email !== 'string' || details.email.length === 0) {
                throw new ForgotPasswordError('invalid_details', 'Invalid details');
            }
            const snaps = await env.authRef.query().filter('email', '==', details.email).get();
            if (snaps.length !== 1) {
                throw new ForgotPasswordError('invalid_email', 'Email address not found, or duplicate entries found');
            }
            const snap = snaps[0];
            const user = snap.val();
            user.uid = snap.key;
            user.password_reset_code = ID.generate();
            // Request a password reset email to be sent:
            const request = {
                type: 'user_reset_password',
                date: new Date(),
                ip: req.ip,
                resetCode: createSignedPublicToken({ uid: user.uid, code: user.password_reset_code }, env.tokenSalt),
                user: {
                    email: user.email,
                    uid: user.uid,
                    username: user.username,
                    settings: user.settings,
                    displayName: user.display_name
                }
            };
            await Promise.all([
                env.config.email.send(request),
                snap.ref.update({ password_reset_code: user.password_reset_code })
            ]);
            env.logRef.push({ action: 'forgot_password', success: true, email: details.email, ip: req.ip, date: new Date() });
            res.send('OK');
        }
        catch (err) {
            env.logRef.push({ action: 'forgot_password', success: false, code: err.code || 'unexpected', message: err.code ? null : err.message, email: details.email, ip: req.ip, date: new Date() });
            if (err.code) {
                sendBadRequestError(res, err);
            }
            else {
                sendUnexpectedError(res, err);
            }
        }
    });
};
export default addRoute;
//# sourceMappingURL=auth-forgot-password.js.map