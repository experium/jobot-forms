const name = (className, filePath) => {
    const pathArray = filePath.split('/');
    const fileName = pathArray[pathArray.length - 1];
    const isModule = fileName.includes('module');

    if (isModule) {
        const moduleName = fileName.split('.')[0];

        return `${moduleName}__${className}`;
    } else {
        return className;
    }
};

module.exports = name;
