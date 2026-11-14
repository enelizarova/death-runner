import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { format, resolveConfig } from 'prettier';

const projectRoot = process.cwd();
const stylesDirectory = path.join(projectRoot, 'src', 'styles');
const mode = process.argv[2];
const printWidth = 100;
const tabWidth = 4;

const isTextColor = (utility) =>
    /^text-(?:transparent|current|black|white|inherit|\[(?:#|rgb|hsl|hwb|lab|lch|oklab|oklch|color|var\())/.test(
        utility,
    );

const utilityGroups = [
    {
        name: 'position',
        matches: (utility) =>
            /^(?:static|fixed|absolute|relative|sticky|inset(?:-[xy])?-.+|top-.+|right-.+|bottom-.+|left-.+|z-.+|translate(?:-[xyz])?-.+)$/.test(
                utility,
            ),
    },
    {
        name: 'layout',
        matches: (utility) =>
            /^(?:block|inline|inline-block|flow-root|flex|inline-flex|grid|inline-grid|contents|table|hidden|size-.+|w-.+|min-w-.+|max-w-.+|h-.+|min-h-.+|max-h-.+|aspect-.+|overflow-.+|overscroll-.+|object-.+|box-.+|columns-.+|flex-.+|grow|grow-.+|shrink|shrink-.+|basis-.+|grid-.+|col-.+|row-.+|auto-cols-.+|auto-rows-.+|place-.+|items-.+|justify-.+|content-.+|self-.+|order-.+)$/.test(
                utility,
            ),
    },
    {
        name: 'spacing',
        matches: (utility) =>
            /^(?:-?m[trblxy]?-.+|p[trblxy]?-.+|gap(?:-[xy])?-.+|space-[xy]-.+)$/.test(utility),
    },
    {
        name: 'typography',
        matches: (utility) =>
            (!isTextColor(utility) && /^text-.+/.test(utility)) ||
            /^(?:font-.+|leading-.+|tracking-.+|antialiased|subpixel-antialiased|italic|not-italic|normal-nums|ordinal|slashed-zero|lining-nums|oldstyle-nums|proportional-nums|tabular-nums|diagonal-fractions|stacked-fractions|uppercase|lowercase|capitalize|normal-case|truncate|line-clamp-.+|underline|overline|line-through|no-underline|decoration-.+|underline-offset-.+|whitespace-.+|break-.+|hyphens-.+)$/.test(
                utility,
            ),
    },
    {
        name: 'interaction',
        matches: (utility) =>
            /^(?:cursor-.+|pointer-events-.+|resize|resize-.+|scroll-.+|snap-.+|touch-.+|select-.+|appearance-.+|caret-.+|accent-.+|will-change-.+|content-.+)$/.test(
                utility,
            ),
    },
    {
        name: 'appearance',
        matches: (utility) =>
            isTextColor(utility) ||
            /^(?:bg-.+|from-.+|via-.+|to-.+|border|border-.+|rounded|rounded-.+|divide-.+|outline|outline-.+|ring|ring-.+|fill-.+|stroke-.+)$/.test(
                utility,
            ),
    },
    {
        name: 'effects',
        matches: (utility) =>
            /^(?:shadow|shadow-.+|opacity-.+|mix-blend-.+|bg-blend-.+|filter|blur-.+|brightness-.+|contrast-.+|grayscale|grayscale-.+|hue-rotate-.+|invert|invert-.+|saturate-.+|sepia|sepia-.+|drop-shadow-.+|backdrop-.+|transition|transition-.+|duration-.+|ease-.+|delay-.+|animate-.+|transform|transform-.+|origin-.+|rotate-.+|scale-.+|skew-.+)$/.test(
                utility,
            ),
    },
];

if (mode !== '--write' && mode !== '--check') {
    console.error('Usage: node scripts/format-css.mjs --write|--check');
    process.exit(2);
}

const collectCssFiles = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map((entry) => {
            const entryPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                return collectCssFiles(entryPath);
            }

            return entry.isFile() && entry.name.endsWith('.css') ? [entryPath] : [];
        }),
    );

    return files.flat();
};

const parseUtility = (utility) => {
    let bracketDepth = 0;
    let variantEnd = -1;

    for (let index = 0; index < utility.length; index += 1) {
        const character = utility[index];

        if (character === '[') bracketDepth += 1;
        if (character === ']') bracketDepth -= 1;
        if (character === ':' && bracketDepth === 0) variantEnd = index;
    }

    return {
        variant: utility.slice(0, variantEnd + 1),
        base: utility
            .slice(variantEnd + 1)
            .replace(/^!/, '')
            .replace(/^-/, ''),
    };
};

const createUtilityGroup = () => {
    const group = new Map(utilityGroups.map(({ name }) => [name, []]));
    group.set('other', []);

    return group;
};

const wrapApplyDirective = (indent, utilities) => {
    const continuationIndent = `${indent}${' '.repeat(tabWidth)}`;
    const lines = [];
    let currentLine = `${indent}@apply`;

    for (const utility of utilities) {
        const candidate = `${currentLine} ${utility}`;

        if (candidate.length <= printWidth || currentLine.endsWith('@apply')) {
            currentLine = candidate;
        } else {
            lines.push(currentLine);
            currentLine = `${continuationIndent}${utility}`;
        }
    }

    lines.push(`${currentLine};`);

    return lines;
};

const groupApplyDirectives = (css) => {
    const sourceLines = css.split('\n');
    const formattedLines = [];

    for (let index = 0; index < sourceLines.length; index += 1) {
        const firstMatch = sourceLines[index].match(/^(\s*)@apply\s+(.+);$/);

        if (!firstMatch) {
            formattedLines.push(sourceLines[index]);
            continue;
        }

        const indent = firstMatch[1];
        const utilities = [];

        while (index < sourceLines.length) {
            const match = sourceLines[index].match(/^(\s*)@apply\s+(.+);$/);

            if (!match || match[1] !== indent) {
                break;
            }

            utilities.push(...match[2].trim().split(/\s+/));
            index += 1;
        }

        index -= 1;

        const groupedUtilities = new Map([['', createUtilityGroup()]]);

        for (const utility of utilities) {
            const { variant, base } = parseUtility(utility);
            const group = utilityGroups.find(({ matches }) => matches(base));

            if (!groupedUtilities.has(variant)) {
                groupedUtilities.set(variant, createUtilityGroup());
            }

            groupedUtilities
                .get(variant)
                .get(group?.name ?? 'other')
                .push(utility);
        }

        for (const variantGroups of groupedUtilities.values()) {
            for (const groupUtilities of variantGroups.values()) {
                if (groupUtilities.length > 0) {
                    formattedLines.push(...wrapApplyDirective(indent, groupUtilities));
                }
            }
        }
    }

    return formattedLines.join('\n');
};

const cssFiles = await collectCssFiles(stylesDirectory);
const unformattedFiles = [];

for (const filePath of cssFiles) {
    const source = await readFile(filePath, 'utf8');
    const prettierConfig = (await resolveConfig(filePath)) ?? {};
    const prettierOutput = await format(source, { ...prettierConfig, filepath: filePath });
    const formatted = groupApplyDirectives(prettierOutput);

    if (source === formatted) {
        continue;
    }

    if (mode === '--write') {
        await writeFile(filePath, formatted, 'utf8');
    } else {
        unformattedFiles.push(path.relative(projectRoot, filePath));
    }
}

if (mode === '--write') {
    console.log(`Formatted ${cssFiles.length} CSS files.`);
} else if (unformattedFiles.length > 0) {
    console.error(
        `CSS formatting issues found in:\n${unformattedFiles.map((file) => `- ${file}`).join('\n')}`,
    );
    process.exit(1);
} else {
    console.log(`All ${cssFiles.length} CSS files are formatted.`);
}
