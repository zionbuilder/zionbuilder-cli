module.exports = (options, args) => {
    const service = process.ZIONBUILDER_SERVICE
    const path = require('path')
    const execa = require('execa')
    const { name } = service.pkg

    // TODO: move this to utils
	function titleCase(str) {
		var splitStr = str.toLowerCase().split(' ');
		for (var i = 0; i < splitStr.length; i++) {
			// You do not need to check if i is larger than splitStr length, as your for does that for you
			// Assign it back to the array
			splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
		}
		// Directly return the joined string
		return splitStr.join(' ');
	}

    const config = {
        locations: ['includes'],
        slug: name,
        packageName: titleCase( name.replace("-", " ") ),
        reportBugsUrl: '',
        team: '',
        ...service.options.getOption('l10n')
    }

    const wp = path.resolve( __dirname, '..', '..', './bin/wp-cli.phar' )

    return execa(`php ${wp} i18n make-pot`, [
        '.',
        `languages/${config.packageName}.pot`,
        '--skip-js',
        `--slug=${config.slug}`,
        `--package-name=${config.packageName}`,
        `--headers={"Report-Msgid-Bugs-To": "${config.reportBugsUrl}", "Language-Team": "${config.team}", "POT-Creation-Date": "1970-01-01 00:00+0000"}`
    ] )
}
