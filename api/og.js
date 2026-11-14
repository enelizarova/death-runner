import { ImageResponse } from '@vercel/og';

import { parseSharedResult } from '../shared/result-share.js';

export const config = { runtime: 'edge' };

function element(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.length === 1 ? children[0] : children,
        },
    };
}

export default async function handler(request) {
    const url = new URL(request.url);
    const result = parseSharedResult(url.searchParams);
    const heading = result.outcome === 'victory' ? 'ИИ НЕ ДОГНАЛ!' : 'ИГРА ОКОНЧЕНА';
    const fontResponse = await fetch(new URL('/fonts/AnonymousPro-Bold.woff', url.origin));
    const fontData = await fontResponse.arrayBuffer();
    const characterImage = new URL(result.character.image, url.origin).href;

    return new ImageResponse(
        element(
            'div',
            {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 70,
                    paddingRight: 86,
                    paddingBottom: 70,
                    paddingLeft: 86,
                    background: '#abc4d4',
                    color: '#252d42',
                    fontFamily: 'Anonymous Pro',
                    position: 'relative',
                },
            },
            element('div', {
                style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 116,
                    display: 'flex',
                    background: '#7f8296',
                    borderTopWidth: 28,
                    borderTopStyle: 'solid',
                    borderTopColor: '#80a87c',
                },
            }),
            element(
                'div',
                {
                    style: {
                        width: 740,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        zIndex: 1,
                    },
                },
                element(
                    'div',
                    { style: { display: 'flex', fontSize: 34, color: '#00687b' } },
                    result.character.name,
                ),
                element(
                    'div',
                    {
                        style: {
                            display: 'flex',
                            marginTop: 10,
                            color: result.outcome === 'victory' ? '#00687b' : '#ce3f36',
                            fontSize: 70,
                            lineHeight: 0.95,
                        },
                    },
                    heading,
                ),
                element(
                    'div',
                    {
                        style: {
                            display: 'flex',
                            alignItems: 'baseline',
                            marginTop: 28,
                        },
                    },
                    element(
                        'div',
                        { style: { display: 'flex', fontSize: 128, lineHeight: 1 } },
                        String(result.score),
                    ),
                    element(
                        'div',
                        { style: { display: 'flex', marginLeft: 22, fontSize: 36 } },
                        'ОЧКОВ',
                    ),
                ),
                element(
                    'div',
                    { style: { display: 'flex', marginTop: 22, fontSize: 30 } },
                    'НЕЙРОСЕТЬ ИЛИ ТЫ',
                ),
            ),
            element('img', {
                src: characterImage,
                width: 250,
                height: 340,
                style: { objectFit: 'contain', zIndex: 1 },
            }),
        ),
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Anonymous Pro',
                    data: fontData,
                    weight: 700,
                    style: 'normal',
                },
            ],
            headers: {
                'Cache-Control': 'public, max-age=0, s-maxage=31536000, immutable',
            },
        },
    );
}
