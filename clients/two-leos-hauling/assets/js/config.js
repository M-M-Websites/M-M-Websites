/* Two Leos Hauling: site settings.
 *
 * formAction: where quote requests are sent.
 *   ''  = preview mode. The form validates everything, then shows the exact request
 *         the business would receive, without sending anything. Use this for demos.
 *   'https://formsubmit.co/96shadle@gmail.com' = live. Requests (with photos) are
 *         emailed to the owner by FormSubmit over HTTPS; no keys or passwords live
 *         in this file. The first real request makes FormSubmit email the owner an
 *         "Activate Form" link: he clicks it once. Only switch this on after the
 *         owner agrees to the site.
 */
window.TL_CONFIG = {
  formAction: '',
  maxPhotos: 6,
  maxPhotoMB: 10
};
