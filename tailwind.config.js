export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                kibs: {
                    green: '#66c70e',
                    deepGreen: '#15803d',
                    red: '#e31837',
                    ink: '#1d1f23',
                    panel: '#f7f9fb',
                },
            },
            boxShadow: {
                soft: '0 16px 40px rgba(29, 31, 35, 0.08)',
            },
        },
    },
    plugins: [],
};
