import {ZBarConfigType, ZBarScanner, ZBarSymbolType} from '@undecaf/zbar-wasm'


/**
 * Encapsulates the arguments of the {@link ZBarScanner#setConfig()} calls that
 * are required to configure a scanner for a particular barcode format.
 */
export class ScannerConfig {

    /** Maps {@link external:BarcodeDetector} format names to {@link ScannerConfig}s */
    private static formatsToConfigs: Record<string, ScannerConfig> = {}

    /** Maps {@link ZBarSymbolType}s to format names */
    private static typesToFormats: Record<number, string> = {}

    private readonly symbolType: ZBarSymbolType
    private readonly configType: ZBarConfigType
    private readonly number: number
    private readonly configSteps: Array<ScannerConfig>


    constructor(
        symbolType: ZBarSymbolType,
        configType: ZBarConfigType = ZBarConfigType.ZBAR_CFG_ENABLE,
        number: number = 1
    ) {
        this.symbolType = symbolType
        this.configType = configType
        this.number = number
        this.configSteps = [this]
    }


    /**
     * Registers an {@link ZBarScanner} configuration for a format name.
     *
     * Note: composite formats must be defined *after* the formats of which they consist.
     */
    static register(
        format: string,
        config: ScannerConfig,
        type: number = config.symbolType
    ): ScannerConfig {

        ScannerConfig.formatsToConfigs[format] = config

        // Map each ZBarSymbolType to the name of the first format that
        // contains it. This requires composite formats to be defined
        // *after* the formats of which they consist.
        ScannerConfig.typesToFormats[type] = ScannerConfig.typesToFormats[type] || format

        return config
    }


    /**
     * Returns the format names of the registered {@link ZBarScanner} configurations.
     */
    static formats(): Array<string> {
        return Object.keys(ScannerConfig.formatsToConfigs)
    }


    /**
     * Returns the barcode format name associated with a {@link ZBarSymbolType}.
     */
    static toFormat(type: ZBarSymbolType): string {
        return ScannerConfig.typesToFormats[type]
    }


    /**
     * Configures an {@link ZBarScanner} to detect barcodes with the specified format.
     */
    static configure(scanner: ZBarScanner, format: string) {
        ScannerConfig.formatsToConfigs[format]?.configSteps.forEach(c => scanner.setConfig(c.symbolType, c.configType, c.number))
    }


    /**
     * Adds a configuration step to this configuration.
     */
    add(config: ScannerConfig): ScannerConfig {
        this.configSteps.push(config)
        return this
    }
}


/*
 * Register scanner configurations for all supported barcode formats.
 * Barcode format names are a superset of the Barcode detection API,
 * see https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API
 *
 * This build of @undecaf/zbar-wasm supports: ean, databar, code128, code93, code39, codabar, i25, qrcode, sqcode.
 *
 * Note: composite formats must be defined *after* the formats of which they consist.
 */
ScannerConfig.register('codabar',
    new ScannerConfig(ZBarSymbolType.ZBAR_CODABAR))
ScannerConfig.register('code_39',
    new ScannerConfig(ZBarSymbolType.ZBAR_CODE39))
ScannerConfig.register('code_93',
    new ScannerConfig(ZBarSymbolType.ZBAR_CODE93))
ScannerConfig.register('code_128',
    new ScannerConfig(ZBarSymbolType.ZBAR_CODE128))
ScannerConfig.register('databar',
    new ScannerConfig(ZBarSymbolType.ZBAR_DATABAR))
ScannerConfig.register('databar_exp',
    new ScannerConfig(ZBarSymbolType.ZBAR_DATABAR_EXP))
ScannerConfig.register('ean_2',
    new ScannerConfig(ZBarSymbolType.ZBAR_EAN2))
ScannerConfig.register('ean_5',
    new ScannerConfig(ZBarSymbolType.ZBAR_EAN5))
ScannerConfig.register('ean_8',
    new ScannerConfig(ZBarSymbolType.ZBAR_EAN8))
ScannerConfig.register('ean_13',
    new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
ScannerConfig.register('ean_13+2',
    new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN2))
ScannerConfig.register('ean_13+5',
    new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN5))
ScannerConfig.register('isbn_10',
    new ScannerConfig(ZBarSymbolType.ZBAR_ISBN10))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
ScannerConfig.register('isbn_13',
    new ScannerConfig(ZBarSymbolType.ZBAR_ISBN13))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
ScannerConfig.register('isbn_13+2',
    new ScannerConfig(ZBarSymbolType.ZBAR_ISBN13))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN2))
ScannerConfig.register('isbn_13+5',
    new ScannerConfig(ZBarSymbolType.ZBAR_ISBN13))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN5))
ScannerConfig.register('itf',
    new ScannerConfig(ZBarSymbolType.ZBAR_I25))
ScannerConfig.register('qr_code',
    new ScannerConfig(ZBarSymbolType.ZBAR_QRCODE))
ScannerConfig.register('sq_code',
    new ScannerConfig(ZBarSymbolType.ZBAR_SQCODE))
ScannerConfig.register('upc_a',
    new ScannerConfig(ZBarSymbolType.ZBAR_UPCA))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
ScannerConfig.register('upc_e',
    new ScannerConfig(ZBarSymbolType.ZBAR_UPCE))
    .add(new ScannerConfig(ZBarSymbolType.ZBAR_EAN13))
