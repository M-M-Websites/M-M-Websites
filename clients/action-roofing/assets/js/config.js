/* Action Roofing: site settings.
 *
 * formAction: where estimate requests go.
 *   ''  = preview mode (now). The form validates everything and shows the request
 *         Action Roofing would receive, but sends nothing and says so plainly.
 *   'https://formsubmit.co/<address>' = live. Requests (with photos) are emailed by
 *         FormSubmit over HTTPS; no keys or passwords live in this file. The first
 *         real request makes FormSubmit email the owner an "Activate Form" link.
 *         Proposed address: actionroofing123@gmail.com. Only switch this on after the
 *         owner confirms the address (notes/owner-checklist.md, item 17).
 */
window.AR_CONFIG = {
  formAction: '',
  maxPhotos: 5,
  maxPhotoMB: 10,
  minSeconds: 3
};
