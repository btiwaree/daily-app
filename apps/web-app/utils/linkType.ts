export enum LinkType {
  FIGMA = 'figma',
  LINEAR = 'linear',
  NOTION = 'notion',
  SLACK = 'slack',
  GITHUB = 'github',
  UNKNOWN = 'unknown',
}

export function getLinkTypeDisplayName(linkType: string): string {
  const displayNames: Record<string, string> = {
    [LinkType.FIGMA]: 'Figma',
    [LinkType.LINEAR]: 'Linear',
    [LinkType.NOTION]: 'Notion',
    [LinkType.SLACK]: 'Slack',
    [LinkType.GITHUB]: 'GitHub',
    [LinkType.UNKNOWN]: 'Unknown',
  };

  return displayNames[linkType] || linkType;
}

export function getLinkTypeBadgeVariant(
  linkType: string,
): 'figma' | 'linear' | 'notion' | 'slack' | 'github' | 'unknown' {
  const variants: Record<
    string,
    'figma' | 'linear' | 'notion' | 'slack' | 'github' | 'unknown'
  > = {
    [LinkType.FIGMA]: 'figma',
    [LinkType.LINEAR]: 'linear',
    [LinkType.NOTION]: 'notion',
    [LinkType.SLACK]: 'slack',
    [LinkType.GITHUB]: 'github',
    [LinkType.UNKNOWN]: 'unknown',
  };

  return variants[linkType] || 'unknown';
}
