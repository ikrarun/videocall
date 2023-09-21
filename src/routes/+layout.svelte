<script>
	import Header from '$lib/base/header.svelte';
	import '../app.postcss';
</script>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>
</div>

<style>
</style>
