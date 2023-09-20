<script>
	import Header from '$lib/base/header.svelte';
	import '../app.postcss';
	import Notifications from 'svelte-notifications';

</script>

<div class="app">
	<Header />
	<Notifications>

		<main>
			<slot />
		</main>
	</Notifications>
</div>

<style>
</style>
