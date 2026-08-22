export class ObjectBuilder
{
	private map = new Map<string, string>();

	add(name: string, version: string, condition = true)
	{
		if (condition) this.map.set(name, version);
		return this;
	}

	buildSorted()
	{
		const sortedEntries = [...this.map.entries()]
			.sort(([a], [b]) => a.localeCompare(b));

		return Object.fromEntries(sortedEntries);
	}

	build()
	{
		return Object.fromEntries(this.map.entries());
	}
}
