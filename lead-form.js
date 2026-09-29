(function () {
  'use strict';

  var endpoint = 'https://odoo.saatpilot.de/contact';
  var forms = document.querySelectorAll('form[action="' + endpoint + '"]');

  function messageForStatus(status) {
    if (status === 400) return 'Bitte prüfen Sie Ihre Eingaben.';
    if (status === 403) return 'Diese Domain ist im Kontakt-Backend noch nicht freigegeben.';
    if (status === 413) return 'Die Anfrage ist zu groß. Bitte kürzen Sie Ihre Nachricht.';
    if (status === 429) return 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.';
    if (status === 502 || status === 503) return 'Der Versand ist momentan nicht möglich. Bitte versuchen Sie es später erneut.';
    return 'Der Versand ist momentan nicht möglich. Bitte versuchen Sie es später erneut.';
  }

  Array.prototype.forEach.call(forms, function (form) {
    var submit = form.querySelector('button[type="submit"], input[type="submit"]');
    var status = form.querySelector('[data-lead-status]');

    if (!status) {
      status = document.createElement('p');
      status.setAttribute('data-lead-status', '');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.style.minHeight = '1.5em';
      form.appendChild(status);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (submit) submit.disabled = true;
      status.textContent = 'Wird gesendet …';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form))
      }).then(function (response) {
        return response.json().catch(function () { return null; }).then(function (payload) {
          if (response.ok && payload && payload.ok === true) {
            status.textContent = 'Vielen Dank! Ihre Anfrage wurde gesendet.';
            form.reset();
            return;
          }
          var error = new Error('lead-submit-failed');
          error.status = response.status;
          throw error;
        });
      }).catch(function (error) {
        status.textContent = error && error.status ? messageForStatus(error.status) : 'Verbindung fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.';
      }).finally(function () {
        if (submit) submit.disabled = false;
      });
    });
  });
})();
