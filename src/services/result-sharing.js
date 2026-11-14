function supportsNativeShare(navigatorObject, matchMedia, shareData) {
    const hasTouchInput =
        Number(navigatorObject?.maxTouchPoints) > 0 ||
        matchMedia?.('(pointer: coarse)').matches === true;
    if (!hasTouchInput || typeof navigatorObject?.share !== 'function') return false;

    try {
        return (
            typeof navigatorObject.canShare !== 'function' || navigatorObject.canShare(shareData)
        );
    } catch {
        return false;
    }
}

function copyWithSelection(text, documentObject) {
    if (!documentObject?.body || typeof documentObject.execCommand !== 'function') return false;

    const textarea = documentObject.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    documentObject.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    try {
        return documentObject.execCommand('copy');
    } finally {
        textarea.remove();
    }
}

async function copyLink(text, { navigatorObject, documentObject, isSecureContext }) {
    if (isSecureContext && typeof navigatorObject?.clipboard?.writeText === 'function') {
        try {
            await navigatorObject.clipboard.writeText(text);
            return true;
        } catch {
            // Some browsers expose Clipboard API but reject it. Try the selection fallback.
        }
    }

    return copyWithSelection(text, documentObject);
}

export async function shareOrCopyResult(
    shareData,
    {
        navigatorObject = globalThis.navigator,
        documentObject = globalThis.document,
        matchMedia = globalThis.matchMedia?.bind(globalThis),
        isSecureContext = globalThis.isSecureContext === true,
    } = {},
) {
    if (supportsNativeShare(navigatorObject, matchMedia, shareData)) {
        try {
            await navigatorObject.share(shareData);
            return 'shared';
        } catch (error) {
            if (error?.name === 'AbortError') return 'cancelled';
        }
    }

    return (await copyLink(shareData.url, { navigatorObject, documentObject, isSecureContext }))
        ? 'copied'
        : 'failed';
}
