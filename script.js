document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quoteForm');
    const successMessage = document.getElementById('success-message');
    const phoneInput = document.getElementById('phone');
    const jobTypeSelect = document.getElementById('jobType');

    // ============================================
    // GA4 EVENT TRACKING - LEAD GENERATION
    // PLACEHOLDER: gtag may be undefined until GA4 is configured
    // ============================================
    
    /**
     * Helper function to send GA4 events
     * @param {string} eventName - The event name (e.g., 'click_call', 'form_submit')
     * @param {string} category - Event category (e.g., 'phone', 'lead')
     * @param {string} label - Event label for additional context
     */
    function trackGA4Event(eventName, category, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'event_category': category,
                'event_label': label
            });
        }
    }

    // Track phone call clicks (tel: links)
    // This fires when a user clicks any phone number link on the page
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(function(phoneLink) {
        phoneLink.addEventListener('click', function() {
            // Extract phone number from href (remove "tel:" prefix)
            const phoneNumber = this.getAttribute('href').replace('tel:', '');
            // Track click-to-call event with phone number as label
            trackGA4Event('click_call', 'phone', phoneNumber);
        });
    });

    // Map job type values to readable labels (roofing services)
    const jobTypeLabels = {
        'roof-repair': 'Roof Repair',
        'roof-replacement': 'Roof Replacement',
        'leak-detection': 'Leak Detection',
        'storm-damage': 'Storm Damage',
        'shingle-replacement': 'Shingle Replacement (Owens Corning Duration)',
        'other': 'Other'
    };

    // Clean phone input on blur
    phoneInput.addEventListener('blur', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length === 10) {
            this.value = `(${value.slice(0,3)}) ${value.slice(3,6)}-${value.slice(6)}`;
        } else {
            this.value = value;
        }
    });

    // Handle form submission to Formspree
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value.trim();
        const phone = phoneInput.value.replace(/\D/g, '');
        const jobType = jobTypeSelect.value;
        const location = document.getElementById('location').value.trim();
        const details = document.getElementById('details').value.trim();

        // Prepare form data for Formspree
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('job_type', jobTypeLabels[jobType] || jobType);
        formData.append('location', location);
        formData.append('details', details || 'N/A');

        // Submit to Formspree
        fetch('https://formspree.io/f/mlgerlop', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(function(response) {
            if (response.ok) {
                // Hide form and show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';

                // Track form submission in GA4
                // This fires when the form is successfully submitted and success message is shown
                trackGA4Event('form_submit', 'lead', 'quote_form');

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Reset form
                form.reset();
            } else {
                // Handle error (optional - could show error message)
                alert('There was a problem submitting your request. Please try again or call us directly.');
            }
        })
        .catch(function(error) {
            // Handle network error
            alert('There was a problem submitting your request. Please try again or call us directly.');
        });
    });
});
