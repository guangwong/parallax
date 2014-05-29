## 综述

Parallax是一个分层视差的组件。抱着不重复造轮子的思想，它基于一个jQuery插件重构、优化、精简而来。基本上和jQuery版本的已经差异很多了。基于 requestAnimationFrame 实现，低版本做了额外 setTimeout 兼容。并使用了 CSS 的 3D / 2D 加速特性，效率和流畅度上得以保证。  

* 版本：1.0
* 作者：九十
* demo：[http://gallery.kissyui.com/parallax/1.0/demo/index.html](http://gallery.kissyui.com/parallax/1.0/demo/index.html)

## 依赖HTML结构

```
	<div class="parallax-scene">
		<div class="layer" data-depth="0.2" data-limit-y="30" data-limit-x="30"  ><img src="images/bg.jpg"></div>
		<div class="layer" data-depth="0.4" ><img src="images/fruit-clearness.png"></div>
		<div class="layer" data-depth="1.0"><img src="images/fruit-blur.png"></div>
	</div>

```

## 初始化组件
```
S.use('gallery/parallax/1.0/index', function (S, Parallax) {
	new Parallax(".parallax-scene", {
		frictionY : 0.05,
		frictionX : 0.05
	});
})
```

## API说明

### Class Parallax
* `Constructor`
	* `scene` ： 关联的Dom结构根节点，上面代码中的 `.parallax-scene` 部分
	* `options` ： 如下参数
		* `scalarX` ：标量X，默认10，越大移动幅度越大
		* `scalarX` ：标量X，默认10，越大移动幅度越大
		* `frictionX` ：摩擦系数X，默认0.1，越大运动越快速
		* `frictionY` ：摩擦系数Y，默认0.1，越大运动越快速
		* `originX` ：计算时使用的X中心点，默认0.5
		* `originY` ：计算时使用的Y中心点，默认0.5

### HTML 钩子
* `.layer`
	* `HTML属性`
		* `data-depth`：景深值，不可缺失，无默认值。0为不移动。
		* `data-limit-y`：Y轴最大的移动幅度，像素单位，可省略
		* `data-limit-x`：X轴最大的移动幅度，像素单位，可省略
		