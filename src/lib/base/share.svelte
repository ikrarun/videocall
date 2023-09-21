<script lang="ts">
	import Icon from '@iconify/svelte';

	export let title: string;
	export let text: string;
	export let url: string;
	let visible: boolean = true;

	function shareContent() {
		if (navigator.share) {
			visible = true;
			navigator
				.share({
					title,
					text,
					url
				})
				.then(() => {
					//   console.log('Content shared successfully');
				})
				.catch((error) => {
					//   console.error('Error sharing content:', error);
				});
		} else {
			visible = false;
			console.warn('Web Share API is not supported in this browser');
		}
	}
</script>

<button
	class={visible ? 'p-2 bg-blue-500 text-2xl font-semibold text-white rounded-full' : 'hidden'}
	on:click|preventDefault={shareContent}
>
	<Icon icon="octicon:share-24" />
</button>
