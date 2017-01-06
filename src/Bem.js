const Bem = {

    mSeparator: '--',
    eSeparator: '__',

    m(base, modifier) {
        modifier = modifier.split(' ');
        let finalClass = [];

        const mSeparator = this.mSeparator;
        modifier.forEach(function (className) {
            finalClass.push(base + mSeparator + className);
        });

        return finalClass.join(' ');
    },

    e(base, element) {
        return base + this.eSeparator + element;
    }

};

export default Bem;
